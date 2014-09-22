/**
* 执行fn并把一个新的Wrapper的$()和$$()传递给它
* 如果没有传递任何参数，则执行{@link M.exportDSL}
* @namespace {Function} M
* @param {Function} [fn] 
*/
var M=function(fn){
	if(arguments.length == 0){
		return M.exportDSL();
	}else if(fn){
		var wrapper = M.$wrapper();
		var args = Array.prototype.slice.call(arguments, 1);
		return fn.apply(this, [wrapper.$, wrapper.$$].concat(args));
	}
}

/**
* 引用当前运行环境的全局对象
* 浏览器中指向window，node环境下指向global
*/
M.global = this;
if(typeof global != "undefined")M.global = global;

/**
* 将May.js的关键字方法复制到目标对象
* 如果未传递target参数，则使用eval()导出到当前作用域内
* @param {Object} [target] 目标对象
*/
M.exportDSL = function(target) {
    var _getKeywordFunc = function(){
        return Object.keys(M).filter(function(name){
            return (/^\$/).test(name) && ["$", "$$"].indexOf(name) == -1;
        });
    }

    if(target){
        _getKeywordFunc().forEach(function (prop) {
            target[prop] = M[prop];
        });
    }else{
        return M.util.dsl(M, _getKeywordFunc()) + M.util.dsl(M.$wrapper());
    }
}

if(typeof(module) != "undefined")module.exports = M;

/** @namespace M.util **/
M.util = {
    /**
    * 获取函数的参数名称
    * @example
    * function Add(number1, number2){}
    * M.util.parseArguNames(Add);
    * => ["number1", "number2"]
    * @param {function} fn
    * @returns {Array}
    */
    parseArguNames: function (fn) {
        var m = fn.toString().match(/.*?\((.*)?\)/);
        if(m && m[1]) {
            return m[1].split(",").map(function(i){ return i.trim();});
        }
        return [];
    },

    /**
    * 包装只有两个参数的函数, 包装后会把第二个参数开始的所有参数依次传递给原函数运行
    * @param {function(param, param2)} fn
    * @returns {function}
    */
    makeMultiTargetFn: function (fn){
        return function(){
            if(arguments.length <= 2){
                return fn(arguments[0], arguments[1]);
            }else{//3个以上
                var arg0 = arguments[0];
                for(var i=1, l=arguments.length; i<l; i++){
                    if(fn(arg0, arguments[i]) === false){
                        return false;
                    }
                }
                return true;
            }
        }
    },
    /**
     * 将值转换成其对应的引用对象
     * @param {string|number|bool} value
     * @returns {Object}
     */
    toObject: function(value) {
        var obj = value;
        switch(typeof value){
            case 'string':
                obj = new String(value);
                break;
            case 'number':
                obj = new Number(value);
                break;
            case 'boolean':
                obj = new Boolean(value);
                break;
        }
        return obj;
    },

    /** 在函数内部调用函数自身, 代替引用auguments.callee **/
    fn: function() {
        return arguments.callee.caller.apply(this, arguments);
    },

    /**
     * 将类Array对象转换成真正的Array
     * @param  {Object} arrayLikeObj
     * @returns {Array}
     */
    parseArray: function(arrayLikeObj) {
        return Array.prototype.slice.call(arrayLikeObj, 0);
    },


    /**
     * 声明一个枚举
     * @param {...String} names enumeration key
     * @example
     * var color = M.$enum("BLUE", "RED", "YELLOW");
     * color.BLUE
     * color.RED
     * color.YELLOW
     *
     * var color = M.$enum({
     *  "BLUE": -1,
     *  "RED": 1
     * })
     */
    enumeration: function(names) {
        if(typeof names == "object") {
            return arguments[0];
        }

        var _enum = {};
        for(var i = 0, l = arguments.length; i < l; i++) {
            _enum[arguments[i]] = {};
        }

        return _enum;
    },


    /**
     * 包装纯函数，包装时指定纯函数的第一参数
     * @param  {function} fn 纯函数
     * @param  {Object}   [firstParam=this] fn的第一个参数，如果未传递getFirstParam参数
     * @param  {function(firstParam)} [getFirstParam] 获取fn的第一个参数的函数，调用时将把firstParam传递给它
     * @return {function}
     */
    methodize: function(fn, firstParam, getFirstParam) {
        return function() {
            //获取第一个参数
            var p1 = firstParam || this;
            if(getFirstParam) p1 = getFirstParam(p1);

            //把第一个参数和其他参数放在一起
            var slice = Array.prototype.slice;
            var args = [p1].concat(slice.call(arguments));

            return fn.apply(this, args);
        }
    },

    /**
     * 重写对象的方法，新方法将调用overwriter并把原方法作为第一个参数传递给它
     * @param  {Object} obj 要重写方法的对象 
     * @param  {string} funcName 被重写的方法名
     * @param  {function} overwriter 真正的覆盖函数
     * @example
     * var Jim = {
     *     sayHi: function(){ return "Hi"}
     * }
     *
     * M.util.overwrite(Jim, "sayHi", function(oldFn, name){
     *     return oldFn.call(this) + ", " + name + "!";
     * })
     * 
     * Jim.sayHi("Lucy");
     * => "Hi, Lucy!"
     */
    overwrite: function(obj, funcName, overwriter) {
        var _oldFn = obj[funcName].bind(obj);
        obj[funcName] = function() {
            var args = [_oldFn].concat(Array.prototype.slice.call(arguments, 0));
            return overwriter.apply(this, args);
        };
    },

    /**
     * 生成将对象的成员导出到当前作用域的代码，该代码可被eval()正确执行,
     * 该函数生成的代码不能在strict模式下运行
     * @param  {string} [obj=this]
     * @param {string} [members] 指定要导入的成员，未指定则导入全部成员，用空格分隔成员名
     * @return {string}
     * @example
     * var Calculator = {
     *     add: function(a, b){ return a + b },
     *     sub: function(a, b){ return a - b }
     * }
     *
     * eval(M.util.dsl(Calculator));
     *
     * add(4, 6);
     * sub(10, 4);
     */
    dsl: function(obj, members) {
        obj = obj || this;

        var tempVarName =  "_temp" + Date.now() + Math.random().toString().substr(2);
        eval(tempVarName + "={value: {}}");

        var temp = eval(tempVarName);
        temp.value = obj;


        if(typeof members == "string" && members !== ""){
            members = members.split(" ").map(function(n){ return n.trim(); });
        }else if(!members){
            members = Object.keys(obj);
        }

        var codes = members.map(function(name) {
            //可以加入检查是否已经定义的功能，如已定义则警告。
            return name + "=" + tempVarName + ".value" + "['" + name + "']";
        });
        
        return "var " + codes.join(",") + ";delete " + tempVarName + ";";
    },

    /**
     * 运行指定方法，避免在全局作用域下产生全局变量
     * @param {function} fn
     */
    run: function(fn) {
        if(arguments.length == 1) {
            return fn();
        } else {
            return fn.apply(this, Array.prototype.slice.call(arguments, 1));
        }
    }
}

/** 
 * 在函数内部调用函数自身, 代替引用auguments.callee，是{@link M.util.fn}的别名
 * @memberof M
 * @function
 **/
M.$fn = M.util.fn;

/**
 * 运行指定方法，避免在全局作用域下产生全局变量，是{@link M.util.run}的别名
 * @memberof M
 * @function
 * @param {function} fn
 */
M.$run = M.util.run;

/**
 * 声明一个枚举，是{@link M.util.enumeration}的别名
 * @memberof M
 * @function
 * @param {...String} names enumeration key
 * @example
 * var color = M.$enum("BLUE", "RED", "YELLOW");
 * color.BLUE
 * color.RED
 * color.YELLOW
 *
 * var color = M.$enum({
 *  "BLUE": -1,
 *  "RED": 1
 * })
 */
M.$enum = M.util.enumeration;

/**
 * 重写对象的方法，新方法将调用overwriter并把原方法作为第一个参数传递给它，是{@link M.util.overwrite}的别名
 * @memberof M
 * @function
 * @param  {Object} obj 要重写方法的对象 
 * @param  {string} funcName 被重写的方法名
 * @param  {function} overwriter 真正的覆盖函数
 * @example
 * var Jim = {
 *     sayHi: function(){ return "Hi"}
 * }
 *
 * M.util.overwrite(Jim, "sayHi", function(oldFn, name){
 *     return oldFn.call(this) + ", " + name + "!";
 * })
 * 
 * Jim.sayHi("Lucy");
 * => "Hi, Lucy!"
 */
M.$overwrite = M.util.overwrite;

/**
 * 包装纯函数，包装时指定纯函数的第一参数，是{@link M.util.methodize}的别名
 * @memberof M
 * @function
 * @param  {function} fn 纯函数
 * @param  {Object}   [firstParam=this] fn的第一个参数，如果未传递getFirstParam参数
 * @param  {function(firstParam)} [getFirstParam] 获取fn的第一个参数的函数，调用时将把firstParam传递给它
 * @return {function}
 */
M.$methodize = M.util.methodize;

/**
 * 生成将对象的成员导出到当前作用域的代码，该代码可被eval()正确执行,
 * 该函数生成的代码不能在strict模式下运行，是{@link M.util.dsl}的别名
 * @memberof M
 * @function
 * @param  {string} [obj=this]
 * @param {string} [members] 指定要导入的成员，未指定则导入全部成员，用空格分隔成员名
 * @return {string}
 * @example
 * var Calculator = {
 *     add: function(a, b){ return a + b },
 *     sub: function(a, b){ return a - b }
 * }
 *
 * eval(M.util.dsl(Calculator));
 *
 * add(4, 6);
 * sub(10, 4);
 */
M.$dsl = M.util.dsl;

/** @namespace M.MObjectUtil **/
M.MObjectUtil = {
    /**
    * 判断name是否符合私有成员的名称规范
    * @param {string} name
    * @returns {boolean}
    */
    isPrivate: function(name) {
        return(/^__/).test(name);
    },

    /**
    * 判断name是否符合受保护成员的名称规范
    * @param {string} name
    * @returns {boolean}
    */
    isProtected: function(name) {
        return(/^_(?!_)/).test(name);
    },

    /**
    * 判断name是否符合公开成员的名称规范
    * @param {string} name
    * @returns {boolean}
    */
    isPublic: function(name) {
        return !this.isProtected(name) && !this.isPrivate(name);
    },

    /**
    * 判断对象是否拥有指定属性，该属性不能为function
    * @param {string} obj
    * @param {string} property
    * @returns {boolean}
    */
    has: function(obj, property) {
        return(obj && obj.hasOwnProperty(property) && typeof obj[property] != "function") || false;
    },

    /**
    * 判断对象是否可响应指定方法
    * @param {string} obj
    * @param {string} funcName
    * @returns {boolean}
    */
    can: function(obj, funcName) {
        return(obj && obj[funcName] && typeof obj[funcName] == "function") || false;
    },

    /**
    * 遍历对象，调用指定函数
    * @param {string} obj
    * @param {function} fn
    */
    eachAll: function(obj, fn) {
        for(var p in obj) {
            if(fn(p, obj[p]) === false) break;
        }
    },

    /**
    * 遍历对象拥有的成员，调用指定函数
    * @param {string} obj
    * @param {function} fn
    */
    eachOwn: function(obj, fn) {
        for(var p in obj) {
            if(obj.hasOwnProperty(p) && this.isPublic(p)) {
                if(fn(p, obj[p]) === false) break;
            }
        }
    },

    /**
    * 遍历对象的属性（除方法外的所有成员），调用指定函数
    * @param {string} obj
    * @param {function} fn
    */
    eachProp: function(obj, fn) {
        this.eachOwn(obj, function(p, op) {
            if(typeof op != "function") {
                return fn(p, op);
            }
        });
    },

    /**
     * 根据指定属性来追溯
     * @param {Object} obj 对象
     * @param {String} prop 属性名
     * @param {function(a)} fn 处理函数(追溯到的对象)
     * @returns {boolean} 全部处理完返回true，否则false
     */
    traverseChain: function(obj, prop, fn) {
        var v = obj[prop];
        while(v) {
            if(fn(v) === false) return false;
            v = v[prop];
        }
        return true;
    },

    /**
     * clone克隆指定对象，如果对象自己有clone方法，则调用对象自己的clone方法
     * @param  {Object} obj 被克隆的对象
     * @param  {boolean} [deep=false] 是否深度克隆
     * @returns {Object}
     */
    clone: function(o, deep) {
        if(!o) return o;

        if(['object', 'function'].indexOf(typeof(o)) == -1) { //value type
            return o;
        }

        if(typeof o.clone == "function") {
            return o.clone(deep);
        }

        var cloneObj = {};
        var className = Object.prototype.toString.call(o).slice(8, -1);
        if(className === 'Array') {
            cloneObj = [];
            if(deep) {
                for(var i = 0, l = o.length; i < l; i++) {
                    cloneObj.push(arguments.callee(o[i], deep));
                }
            } else {
                cloneObj = o.slice(0);
            }
        } else if(className !== 'Object') {
            cloneObj = new o.constructor(o.valueOf());
        }

        if(deep) {
            for(var p in o) {
                if( p == 'constructor') continue;
                var op = o[p];
                if( p == '__proto__'){
                    cloneObj[p] = op;
                    continue;
                }
                if(Object.prototype.isPrototypeOf(op)) {
                    cloneObj[p] = arguments.callee(op, deep);
                } else {
                    cloneObj[p] = op;
                }
            }
        } else {
            for(var p in o) {
                cloneObj[p] = o[p];
            }
        }
        return cloneObj;
    },

    /**
     * copy members from src to obj
     * @param  {Object} obj [description]
     * @param  {Object} src [description]
     * @param  {String[]} [whitelist=null] 不想被覆盖的成员
     * @return {Object}
     */
    mix: function(obj, src, whitelist) {
        if(!src) return obj;
        var p;
        if(whitelist) {
            for(p in src) {
                if(whitelist.indexOf(p) == -1) {
                    obj[p] = src[p];
                }
            }
        } else {
            for(p in src) {
                obj[p] = src[p];
            }
        }
        return obj;
    },

    /**
     * 依次合并给定的所有对象到一个新的对象
     * @param {...Object} obj
     * @returns {Object} new object, merge 
     */
    merge: function(/*a,b,c,d,...*/) {
        var obj = {},
            curr = null,
            p;

        for(var i = 0, l = arguments.length; i < l; i++) {
            curr = arguments[i];
            if(!curr) continue;
            for(p in curr) {
                obj[p] = curr[p];
            }
        }

        return obj;
    }
}

/**
 * 依次合并给定的所有对象到一个新的对象，是{@link M.MObjectUtil.merge}的别名
 * @memberof M
 * @function
 * @param {...Object} obj
 * @returns {Object} new object, merge 
 */
M.$merge = M.MObjectUtil.merge;

/**
 * copy members from src to obj，是{@link M.MObjectUtil.mix}的别名
 * @memberof M
 * @function
 * @param  {Object} obj [description]
 * @param  {Object} src [description]
 * @param  {String[]} [whitelist=null] 不想被覆盖的成员
 * @return {Object}
 */
M.$mix = M.MObjectUtil.mix;

/**
 * clone克隆指定对象，如果对象自己有clone方法，则调用对象自己的clone方法，是{@link M.MObjectUtil.clone}的别名
 * @memberof M
 * @function
 * @param  {Object} obj 被克隆的对象
 * @param  {boolean} [deep=false] 是否深度克隆
 * @returns {Object}
 */
M.$clone = M.MObjectUtil.clone;

M.util.run(function(M){
    /** 
    * Mayjs的interface的原型对象
    * @memberof M
    * @type Object
    **/
    var Interface = {};

    var _getType = function(obj){
        return Object.prototype.toString.call(obj);
    }

    /* validate types = [null, undefined, "undefined",
            "number", "string", "boolean", "function", 
            Number, String, Boolean, Function];
    */
    var _isValueType = M.util.makeMultiTargetFn(function(type, obj){
        if(type == null || type == "undefined")return obj == null;

        var objType = _getType(obj)
        if(type == "number" || type == Number){
            return objType == _getType(Number.prototype);
        }else if(type == "string" || type == String){
            return objType == _getType(String.prototype);
        }else if(type == "boolean" || type == Boolean){
            return objType == _getType(Boolean.prototype);
        }else if(type == "function" || type == Function){
            return typeof(obj)== "function";
        }else{
            return false;
        }
    });

    var _isInstanceof = M.util.makeMultiTargetFn(function(Clazz, obj){
        if(typeof Clazz != "function")return false;

        if([Array, RegExp, Error, Date].indexOf(Clazz) != -1){
            return _getType(Clazz.prototype) === _getType(obj);
        }

        return obj instanceof Clazz;
    });

    /**
    * 判断对象是否为指定类型
    * @memberof M
    * @function
    * @param {string|function|undefined} type
    * @param {...Object} obj
    * @returns {boolean}
    */
    var $is = M.util.makeMultiTargetFn(function(type, obj){
        if(_isValueType(type, obj))return true;
        if(_isInstanceof(type, obj))return true;
        return false;
    });

    /** 
    * 判断proto是否为obj的原型
    * @memberof M
    * @function
    * @param {Object} proto
    * @param {Object} obj
    * @returns {boolean}
    **/
    var $hasProto = M.util.makeMultiTargetFn(
        function(proto, obj){
            if(typeof proto != "object")return false;
            if(proto == null)return false;
            return proto.isPrototypeOf(obj);
        }
    );

    /**
    * 依次判断给定的参数是否为false，一旦发现为false立即抛出错误
    * @memberof M
    * @function
    * @param {...boolean} result
    */
    var $check = M.util.makeMultiTargetFn(function(result){
        if(result === false){
            throw "$check failed!";
        }
    });

    function _parseArguTypes(arguTypes, arguNames) {
        var meta = [];
        if(_is(Array, arguTypes)) {
            if(arguNames) { //$func声明时带了方法定义，参数类型声明中无参数名项，参数名列表从方法定义中获取
                for(var i = 0, l=arguNames.length; i < l; i++) {
                    meta.push({
                        "name": arguNames[i],
                        "type": arguTypes[i]
                    });
                }
            } else { //在$interface中声明成员方法的参数类型时，需要指定对映参数名，故无须提供参数名列表
                arguTypes.forEach(function(item){
                    for(var arguName in item){
                        if(arguName != "returns"){
                            meta.push({"name": arguName, "type": item[arguName] });
                        }
                        break;
                    }
                });
            }
        } else { //在$func中定义的option,即$func({argu1: Type1, argu2: Type2}, function(argu1, argu2){});
            meta.push({
                "name": arguNames[0],
                "type": $interface(arguTypes)
            });
        }
        return meta;
    }

    /**
    * 给指定方法设定参数的元类型信息
    * @memberof M
    * @param {Object|Interface} arguTypes 参数的类型定义
    * @param {function} fn
    **/
    function $func(arguTypes, fn) {
        fn.__argu_types__ = _parseArguTypes(arguTypes, M.util.parseArguNames(fn));
        return fn;
    }


    /**
     * 创建Interface的快捷方法
     * @memberof M
     * @param  {Object} define interface define
     * @param  {Interface} base base interface
     * @returns {Interface}
     */
    function $interface(define, base) {
        if(base) {
            interface_ = Object.create(base);
        } else {
            interface_ = Object.create(Interface);
        }

        for(var p in define){
            interface_[p] = define[p];
        }

        return interface_;
    }

    /**
    * 判断对象是否为指定类型或者符合指定协议
    * @private
    * @memberof M
    * @param {function|Object|Interface|string} type 类型或者协议
    * @param {Object} obj
    */
    function _is(type, obj){
        if($is(type, obj) || $hasProto(type, obj)){
            return true;
        }

        var t = typeof(type);
        if(t == "function"){
            if(type.prototype && $hasProto(type.prototype, obj))return true;
        }else if(t == "object"){
            return $support(type, obj);
        }

        return false;
    }


    /**
     * 判断一个对象是否支持指定协议
     * @memberof M
     * @param {Interface|Object} interface_
     * @param {Object} obj
     * @param {bool} [exactly=false] 如果为false且对象的已实现接口元信息中包含了该接口，则不再次检查是否支持
     * @returns {boolean}
     */
    function $support(interface_, obj, exactly) {
        if(!exactly && obj.__interfaces__ && obj.__interfaces__.indexOf(interface_) != -1) {
            return true;
        }

        var isOptionalName = /^\[(.*?)\]$/;
        var isMataName = /^__.*__$/;
        for(var name in interface_) {
            var member = obj[name];
            var type = interface_[name];

            var optionalName = name.match(isOptionalName);
            if(optionalName){
                name = optionalName[1];
                member = obj[name]; 
                if(member == null)continue;  //可选参数为null或者undefined则表示没有出现，不用检查
            }

            if(isMataName.test(name))continue;

            if($is(Array, type)){ //用数组实例表示方法签名，如[TypeOfP1, TypeOfP2]，要表示成员类型是数组，用Array类
                if(!typeof(member) == "function")return false;
                continue;  
            }else if(!_is(type, member)){
                return false;
            } 
      }
        return true;
    }

    /**
     * 把指定协议加入对象的已实现协议元信息中，加入前检查是否支持指定协议
     * @memberof M
     * @param {Interface|Object} interface_
     * @param {Object} obj
     */
    function $implement(interface_, obj) {
        var interfaces = obj.__interfaces__ || (obj.__interfaces__ = []);
        if(interfaces.indexOf(interface_) == -1) {
            if(!$support(interface_, obj)) {
                throw "object did not implement given interface";
            }

            //write arguments meta to methods of obj
            Object.keys(interface_).forEach(function(p) {
                if(_is(Array, interface_[p])) { //接口声明用Array来表示方法签名
                    obj[p].__argu_types__ = _parseArguTypes(interface_[p]);
                }
            });

            interfaces.push(interface_);
        }
    }

    M.Interface = Interface;

    M.$interface = $interface;
    M.$support = $support;
    M.$implement = $implement;
    M.$is = $is;
    M.$hasProto = $hasProto;
    M.$func = $func;
    M.$check = $check;
    M._is = _is;
}, M);

M.util.run(function(M) {
    /**
     * 定义一个module，暂时啥也不干，原样返回传入的对象，标识作用
     * @memberof M
     * @param   {Object} obj
     * @returns {Object}
     */
    function $module(o) {
        return o;
    }

    /**
     * 供include module时使用的选项的接口
     * @memberof M
     * @interface
     */
    var IModuleOption = {
        //执行onincluded和methodize时会用到
        "[context]": Object,

        //是否对所有函数成员进行methodize
        "[methdize]": Boolean,

        //通过这个函数获得methodize时的第一参数
        "[methdizeTo]": [Object],

        //可以被mix到哪些类型
        "[supports]": Array
    }

    /** 
    * module interface
    * @memberof M
    * @interface
    **/
    var IModule = {
        "[__option__]": IModuleOption,
        "[init]": Function, //include给Class的prototype后，在Class的constructor内手动调用M.init.call(this)，方便传递类的实例
        "[onIncluded]": Function //include给object后被自动调用，一般不用于include给prototype object
    }

    /**
     * include module to obj with option
     * @memberof M
     * @param  {Object} opt.module
     * @param  {Object} opt.to
     * @param  {Object} opt.option
     * @returns {Object}
     */
    function $include(obj, module, option) {
        var defauls = {
            "methodize": false,
            "context": null, //methodize的参数
            "methodizeTo": null //methodize的参数
        };

        option = M.MObjectUtil.merge(defauls, module.__option__, option);

        var needMethodize = option.methodize;

        M.MObjectUtil.eachOwn(module, function(k, v){
            if("init" !== k && "onIncluded" !== k && !k.match(/^__.*__$/)) {
                //var name = (option.alias && option.alias[k]) ? option.alias[k] : k;
                if(needMethodize && typeof v == "function") {
                    obj[k] = M.util.methodize(v, option.context, option.methodizeTo);
                } else {
                    obj[k] = v;
                }
            }
        });

        
        if(module.__interfaces__) {
            module.__interfaces__.forEach(function(interface_) {
                M.$implement(interface_, obj);
            });
        }

        if(module.onIncluded) {
            module.onIncluded.call(obj, option.context || obj);
        }
    }

    M.$module = $module;
    M.$include = $include;
    M.IModuleOption =  IModuleOption;
    M.IModule = IModule;
}, M);
M.util.run(function(M) {
    var traverseChain = M.MObjectUtil.traverseChain;
    var mix = M.MObjectUtil.mix;

    /**
    * @namespace
    * @memberOf M
    * @type {Object}
    */
    var BaseObj = {
        /** 
        * 元信息：已实现的接口 
        * @member
        */
        __interfaces__: [],
        /** 初始化方法 **/
        initialize: function(){},
        /** 
        * 使用定义信息生成新的对象，新对象的prototype为当前对象
        * @member
        * @param {Object} objDefined 对象定义
        **/
        extend: function(objDefine){
            var obj = Object.create(this);

            if(!Object["__proto__"]) {//for IE browser
                obj["__proto__"] = this;
            }

            for(var name in objDefine){
                var member = objDefine[name]; 
                obj[name] = member;

                //add __name__ to method
                if(typeof(member) == "function"){
                    member.__name__ = name;
                }
            }

            this.initialize.call(obj);
            return obj;
        },
        /**
        * 模拟super关键字，访问原型链中的方法
        * @member
        */
        base: function(){
            var caller = arguments.callee.caller;
            var callerName = caller.name || caller.__name__;
            var callerOwner = this.__getCallerOwner(caller, callerName);
            if(!callerName)callerName = caller.__name__; //在this._getCallerOwner方法中会为caller设置name meta;

            var base = callerOwner ? callerOwner.__proto__ : null;
            var fn = base ? base[callerName] : null;

            if(typeof fn == "function") {
                return fn.apply(this, arguments);
            }
        },
        __getCallerOwner: function(caller, callerName){
            var callerOwner = null;
            if(callerName){
                if(this.hasOwnProperty(callerName) && this[callerName] === caller)return this;

                if(this["__proto__"][callerName] == caller){
                    return this["__proto__"];
                }

                traverseChain(this, "__proto__", function(proto) {
                    if(proto.hasOwnProperty(callerName) && proto[callerName] == caller){
                        callerOwner = proto;
                        return false;
                    }
                });
            }else{
                for(var p in this){
                    if(this[p] === caller){
                        callerOwner = this;
                        caller.__name__ = p;
                        break;
                    }
                }
                if(callerOwner)return callerOwner;

                traverseChain(this, "__proto__", function(proto) {
                    Object.keys(proto).forEach(function(p) {
                        if(proto[p] == caller) {
                            callerOwner = proto;
                            caller.__name__ = p;
                            return false;
                        }
                    });
                });
            }
            return callerOwner;
        }
    }


    /**
    * Klass类，{@link M.BaseObj}是其prototype
    * @inner
    * @memberof M
    * @augments {M.BaseObj}
    * @constructor
    */
    function Klass(){}
    Klass.prototype = BaseObj.extend(/** @lends M~Klass.prototype **/{
        initialize: function(){
            /**
             * 已实现接口元信息
             * @instance
             * @type {Array}
             */
            this.__interfaces__ = [];
            this.base(); //call BaseObj.initialize
        }       
    });

    /**
    * 继承当前类，产生新类
    * @memberof M~Klass
    * @param {Object} classDefine
    */
    Klass.extend = function(classDefine){
        var proto = this.prototype.extend(classDefine);

        if(!proto.hasOwnProperty("initialize")){
            proto.initialize = function(){
                this.base.apply(this, arguments);
            }
        }

        var clazz;
        if(!Object["__proto__"]) {//for IE browser
            clazz = function(){
                if(!proto.isPrototypeOf(this)){
                    return new (arguments.callee);
                }
                this.constructor = clazz;
                this["__proto__"] = proto;
                proto.initialize.apply(this, arguments);
            }
        }else{
            clazz = function(){
                if(!proto.isPrototypeOf(this)){
                    return new (arguments.callee);
                }
                this.constructor = clazz;
                proto.initialize.apply(this, arguments);
            }
        }

        proto.constructor = this;
        clazz.prototype = proto;
        var excludes = ["prototype"];
        for(var p in Klass){
            if(excludes.indexOf(p) == -1){
                clazz[p] = this[p];
            }
        }

        return clazz;
    }

    /**
    * BaseClass
    * @class
    * @augments {M~Klass}
    * @memberof M
    */
    var BaseClass = Klass.extend({})

    /**
     * May.js Object的接口
     * @memberof M
     */
    var IBase = M.$interface({
        "initialize": [],
        "base": [],
        "__interfaces__": Array
    });

    M.$implement(IBase, BaseObj);


    /**
    * 定义一个Mayjs类，该类自动继承{@link M.BaseClass}
    * @memberof M
    * @param {Object} prototype 新类的prototype
    */
    function $class(prototype){
        return BaseClass.extend(prototype);
    }

    /**
    * 定义一个对象，该对象的原型为{@link M.BaseObj}
    * @memberof M
    * @param {Object} obj
    */
    function $obj(obj){
        return BaseObj.extend(obj);
    }



    M.IBase = IBase;
    M.BaseObj = BaseObj;
    M.BaseClass = BaseClass;
    M.$class = $class;
    M.$obj = $obj;
}, M);
M.util.run(function(M) {
    var toObject = M.util.toObject;
    var merge = M.MObjectUtil.merge;
    var mix = M.MObjectUtil.mix;

    /**
    * @memberof M
    * @class
    */
    var Wrapper = M.$class(
        /** @lends M.Wrapper.prototype **/
        {
         /**
          * @alias M.Wrapper
          * @constructor
          */
        initialize: function() {
            /**
            * type -- module map
            * @type Array
            */
            this.__map__ = [];

            /**
            * @type Object
            */
            this.__DSL__ = {
                $: this.$.bind(this),
                $$: this.$$.bind(this),
            }
            this.__DSL__.$.reg = this.$reg.bind(this);
            this.__DSL__.$.clear = this.$clear.bind(this);
        },
        __wrap: function(obj, proxy, option){
            obj = toObject(obj);
            if(!proxy){
                proxy = obj;
            }

            var wrappers = this.__findWrappersByObj(obj);
            if(wrappers.length === 0) return obj;

            wrappers.forEach(function(wrapper) {
                var includeOption = merge(option || {}, wrapper.includeOption);
                M.$include(proxy, wrapper.module, includeOption);
            });

            return proxy;
        },
        /**
        * 清空wrap module表
        */
        $clear: function(){
            this.__map__ = [];
        },

        /**
        * wrap对象，非侵入
        * @param {Object} obj
        */
        $: function(obj) {
            var proxy = {
                valueOf: function(){ return obj}
            }
            return this.__wrap(obj, proxy, {context: obj});
        },

        /**
         * 直接复制wrap modules中的成员到指定对象
         * @param {Object} obj 对象
         */
        $$: function(obj) {
            return this.__wrap(obj);
        },

        /**
         * 将wrap module注册到prototype,Interface或Class
         * @param {Object} module
         * @param {Object|Interface|Function} supports 
         * @param {Object} [option] 
         */
        $reg: function(module, supports, option) {
            var includeOption = option || module.__option__ || {};
            supports = supports || includeOption.supports;
            var types = Array.prototype.isPrototypeOf(supports) ? supports : [supports];

            for(var i=0,l=types.length; i<l; i++){
                var type = types[i];

                var $ = this;
                if(type != Function.prototype) { // typeof Function.prototype == "function" true
                    if(typeof type == "function") {
                        type = type.prototype;
                    }

                    if(type != Function.prototype) {
                        if(!type || ["string", "object"].indexOf(typeof type) == -1) return;
                    }
                }

                if(typeof module != "object") return;

                var map = this.__map__;
                var typeWrappers = map.filter(function(item) {
                    return item.type == type;
                });

                var wrapper = {
                    "module": module,
                    "includeOption": includeOption
                };

                if(typeWrappers.length === 0) {
                    typeWrappers = {
                        "type": type,
                        modules: [wrapper]
                    };
                    map.push(typeWrappers);
                } else {
                    if(typeWrappers[0].modules.filter(function(wrapper) {
                        return wrapper.module == module;
                    }).length === 0) {
                        typeWrappers[0].modules.push(wrapper);
                    }
                }
            }
            return this;
        },


        __findWrappersByType: function(type) {
            var ms = this.__map__.filter(function(item) {
                return item.type == type;
            });

            return ms.length === 0 ? [] : ms[0].modules;
        },

        /**
         * 根据prototype,Interface或Class查找已注册的wrap modules
         * @param {Object|Interface|Function} type
         * @return {Array}
         */
        findWrappersByType: function(type){
            if(this != _globalWrapper){
                return _globalWrapper.__findWrappersByType(type).concat(this.__findWrappersByType(type));
            }else{
                return this.__findWrappersByType(type);
            }
        },

        __findWrappersByPrototype: function(proto) {
            var self = this;
            var wrappers = [];
            var oldProto;

            while(proto) {
                wrappers = wrappers.concat(self.findWrappersByType(proto));
                if(proto.hasOwnProperty("__interfaces__")){
                    proto.__interfaces__.forEach(function(interface_) {
                        wrappers = wrappers.concat(self.findWrappersByType(interface_));
                    });
                }

                oldProto = proto;

                proto = oldProto["__proto__"] || (oldProto.constructor ? oldProto.constructor.prototype : null);

                if(proto == oldProto) {
                    break;
                }
            }

            return wrappers;
        },

        __findWrappersByObj: function(obj) {
            if(obj === null) return [];

            var wrappers = [];
            var self = this;
            var addTypeWrappers = function(type) {
                    wrappers = wrappers.concat(self.findWrappersByType(type));
                };

            var objType = typeof obj;
            if(objType == "object" || objType == "function") { //reference type
                wrappers = wrappers.concat(this.__findWrappersByPrototype(obj["__proto__"] || obj.constructor.prototype));
                if(obj.hasOwnProperty("__interfaces__")){
                    obj.__interfaces__.forEach(function(interface_) {
                        addTypeWrappers(interface_);
                    });
                }
            } //else { //value type
               // addTypeWrappers(objType);
            //}

            return wrappers;
        }
    });

    /**
    * 创建一个新的{@link M.Wrapper}并返回它的__DSL__
    * @memberof M
    */
    M.$wrapper = function () {
        return new Wrapper().__DSL__;
    }

    /**
    * @memberof M~_globalWrapper
    * @instance M.Wrapper
    */
    var _globalWrapper = new Wrapper();

    M.MObjectUtil.mix(M, _globalWrapper.__DSL__);

    M.Wrapper = Wrapper;
}, M);
M.util.run(function(M){
    var $func = M.$func;

    function _checkParams(fn, params) {
        var caller = fn || arguments.callee.caller;
        var paramsMeta = caller.__argu_types__;
        params = params || caller["arguments"];
        var type;
        for(var i = 0, l = params.length; i < l; i++) {
            type = paramsMeta[i].type;
            //将方法的参数声明为null类型，表明其可为任何值，所以总是验证通过
            if(type === null) return true;
            if(!M._is(type, params[i])) {
                return false;
            }
        }
        return true;
    }

    function dispatch(overloads, params) {
        var arguCount = params.length;

        var matches = overloads.filter(function(fn) {
            return fn.__argu_types__.length >= arguCount;
        });
        
        if(matches.length == 0) return null;

        var fn;
        while((fn = matches.shift())) {
            if(_checkParams(fn, params)) {
                return fn;
            }
        }
    }


    /**
     * function overload
     * @memberof M
     * @param {Array} paramsTypes params types
     * @param {function} fn overload function
     * @returns {function}
     * @example
     *   fn = M.$overload(["string","number"], function(name, age){
     *       return "I'm "+name+ " and I'm " + age + " years old";
     *   }).overload(["string"], function(name){
     *       return "i'm " + name;
     *   });
     *
     *   fn.overload(["string", "string"], function(name, interest){
     *       return "I'm " + name + ", and i'm interesting "+ interest;
     *   });
     *
     *   fn("lily"); // => "i'm lily"
     *   fn("lily", 18); // => "I'm lily and I'm 18 years old"
     *   fn("lily", "singing"); //=> "I'm lily, and i'm interesting singing"
     */
    function $overload(paramTypes, fn) {
        //存储重载的方法
        var _overloads = {};
        _overloads.value = [ typeof paramTypes == "function" ? paramTypes : $func(paramTypes, fn)];

        var main = function() {
                var params = arguments;
                var fn = dispatch(_overloads.value, params);
                if(fn) {
                    return fn.apply(this, params);
                }
            };

        main.overload = function(paramTypes, fn) {
            _overloads.value.push(typeof paramTypes == "function" ? paramTypes : $func(paramTypes, fn));
            _overloads.value = _overloads.value.sort(function(fn1, fn2) {
                return fn1.__argu_types__.length - fn2.__argu_types__.length;
            });

            return this;
        };


        return main;
    }

    M.$overload = $overload;
}, M);