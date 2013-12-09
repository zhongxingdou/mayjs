var Mayjs={
    version: 0.1
}
if(typeof(module) != "undefined")module.exports = Mayjs;
Mayjs.util = {
    /**
     * 将一个值对象转换成引用对象
     * @memberof Mayjs
     * @param {Object} value
     * @return {Object}
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

    /**
     * 调用方法自身
     * @memberof Mayjs
     * @return {Function}
     */

    fn: function() {
        return arguments.callee.caller.apply(this, arguments);
    },

    /**
     * 将类Array对象转换成Array
     * @memberof Mayjs
     * @param  {Object} arrayLikeObj
     * @return {Array}
     */

    parseArray: function(arrayLikeObj) {
        return Array.prototype.slice.call(arrayLikeObj, 0);
    },


    /**
     * 声明一个枚举
     * @memberof Mayjs
     * @param {...String} names enumeration key
     * @example
     * var color = $enum("BLUE", "RED", "YELLOW");
     * color.BLUE
     * color.RED
     * color.YELLOW
     *
     * var color = $enum{{
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
     * 将一个纯函数包装成指定对象的一个方法，并在此时设定纯函数的第一参数
     * @memberof Mayjs
     * @param  {Function} fn 纯函数
     * @param  {Object}   [firstParam=this] fn的第一个参数，如果没有getFirstParam的话
     * @param  {Function} [getFirstParam] 使用此函数获取fn的第一个参数，调用此函数时将把firstParam传递给它
     * @return {Function}
     */

    methodize: function(fn, firstParam, getFirstParam) {
        var slice = Array.prototype.slice;
        return function() {
            var obj = firstParam || this;
            var args = [getFirstParam ? getFirstParam(obj) : obj].concat(slice.call(arguments, 0));
            return fn.apply(this, args);
        };
    },

    /**
     * overwrite对象的方法，新方法将调用指定的overwriter并把原方法当作第一个参数传递给它
     * @param  {Object} obj 被覆盖的对象
     * @param  {string} funcName   对象被覆盖的方法名
     * @param  {Function} overwriter 实际替代原方法的函数
     */
    overwrite: function(obj, funcName, overwriter) {
        var _baseFn = obj[funcName].bind(obj);
        obj[funcName] = function() {
            var args = [_baseFn].concat(Array.prototype.slice.call(arguments, 0));
            return overwriter.apply(obj, args);
        };
    },


    /**
     * 生成供eval()函数将指定变量成员声明为当前作用域内变量的代码
     * 导入后会导致对象的方法调用时this变化
     * @memberof Mayjs
     * @param  {String} [obj=this]
     * @return {String}
     * @example
     * var Calculator = {
     *     add: function(a, b){ return a + b },
     *     sub: function(a, b){ return a - b }
     * }
     *
     * eval(localize(Calculator));
     *
     * add(4, 6);
     * sub(10, 4);
     */

    localize: function(obj, names) {
        obj = obj || this;

        //create global tempObj
        var tempVarName = "_temp" + Date.now();
        eval(tempVarName + "={value: {}}");

        //get tempObj and set it's value with obj
        var temp = eval(tempVarName);
        temp.value = obj;

        if(typeof names == "string" && names !== ""){
            names = names.split(" ").map(function(n){ return n.trim(); });
        }else if(!names){
            names = Object.keys(obj);
        }

        //generate members declare string
        // var keys = Object.keys(obj).filter(function(k) {
            // return obj.hasOwnProperty(k) && typeof obj[k] == "function";
        // });

        var members = names.map(function(name) {
            return name + "=" + tempVarName + ".value" + "['" + name + "']";
        });
        return "var " + members.join(",") + "; delete " + tempVarName;
    },

    /**
     * 运行一个方法，一个快捷的使用闭包来避免全局变量的方法
     * @param  {Function} fn [description]
     * @return {[type]}      [description]
     */
    run: function(fn) {
        if(arguments.length == 1) {
            return fn();
        } else {
            return fn.apply(this, Array.prototype.slice.call(arguments, 1));
        }
    }
}

Mayjs.MObjectUtil = {
    isPrivate: function(name) {
        return(/^__/).test(name);
    },

    isProtected: function(name) {
        return(/^_(?!_)/).test(name);
    },

    isPublic: function(name) {
        return !this.isProtected(name) && !this.isPrivate(name);
    },

    have: function(o, property) {
        return(o && o.hasOwnProperty(property) && typeof o[property] != "function") || false;
    },

    can: function(o, fn) {
        return(o && o[fn] && typeof o[fn] == "function") || false;
    },

    eachAll: function(o, fn) {
        for(var p in o) {
            if(fn(p, o[p]) === false) break;
        }
    },

    eachOwn: function(o, fn) {
        for(var p in o) {
            if(o.hasOwnProperty(p) && this.isPublic(p)) {
                if(fn(p, o[p]) === false) break;
            }
        }
    },

    eachProp: function(o, fn) {
        this.eachOwn(o, function(p, op) {
            if(typeof op != "function") {
                return fn(p, op);
            }
        });
    },

    /**
     * 根据指定属性来追溯
     * @memberof Mayjs
     * @param {Object} o 对象
     * @param {String} prop 属性名
     * @param {Function} fn(a) 处理函数(追溯到的对象)
     * @return Boolean 全部处理完则返回true，中途结果返回false
     */

    traverseChain: function(o, prop, fn) {
        var v = o[prop];
        while(v) {
            if(fn(v) === false) return false;
            v = v[prop];
        }
        return true;
    },

    /**
     * clone oect
     * @memberof Mayjs
     * @param  {Object} o 被克隆的对象
     * @param  {Boolean} [deep=false] 是否深度克隆
     * @return {Object} o的克隆
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
                var op = o[p];
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
     * copy members from src to o
     * @memberof Mayjs
     * @param  {Object} o [description]
     * @param  {Object} src [description]
     * @param  {String[]} [whitelist=null] 不想被覆盖的成员
     * @return {Object}
     */
    mix: function(o, src, whitelist) {
        if(!src) return o;
        var p;
        if(whitelist) {
            for(p in src) {
                if(whitelist.indexOf(p) == -1) {
                    o[p] = src[p];
                }
            }
        } else {
            for(p in src) {
                o[p] = src[p];
            }
        }
        return o;
    },

    /**
     * merge o to a to b ... n
     * @memberof Mayjs
     * @param {Object} o
     * @param {Object} a
     * @return {Object} merge result
     */
    merge: function(o, a /*,b,c,...n*/ ) {
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
 * interface 
 */

Mayjs.util.run(function(M){
    var Interface = {};

    /**
     * 对象类型判断
     * @memberof M
     * @argu  {Object|String}  type
     * @argu  {Object}  o
     * @return {Boolean}
     */
    function $is(type, o) {
        if(type === null) return o === null;
        if(type === undefined) return o === undefined;

        var result = false;
        switch(typeof type) {
        case "string":
            result = typeof(o) == type;
            break;
        case "object":
            if(Interface.isPrototypeOf(type)) {
                result = $support(type, o);
            } else {
                result = type.isPrototypeOf(o);
            }
            break;
        case "function":
            var proto = type.prototype;
            if(proto) {
                result = proto.isPrototypeOf(o);
            } else {
                result = o instanceof type;
            }
            break;
        }
        return result;
    }

    function parseArguNames(fn) {
        var m = fn.toString().match(/.*?\((.*)?\)/);
        if(m && m[1]) {
            return m[1].split(",").map(function(i){ return i.trim();});
        }
        return [];
    }

    function _parseArguTypes(arguTypes, arguNames) {
        var meta = [];
        if($is(Array, arguTypes)) {
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
                        var arguType = item[arguType];
                        meta.push({"name": arguName, "type": arguType });
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

    function $func(arguTypes, fn) {
        fn.__argu_types__ = _parseArguTypes(arguTypes, parseArguNames(fn));
        return fn;
    }


    /**
     * 创建Interface的快捷方法
     * @memberof M
     * @argu  {Object} define interface define
     * @argu  {Interface} base base interface
     * @return {Interface}
     */

    function $interface (define, base) {
        if(base) {
            // if(!Interface.isPrototypeOf(base)) throw "Parameter base is not an Interface";
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
     * 判断一个对象是否支持指定协议
     * @memberof M
     * @argu  {Interface} interface_
     * @argu  {Object} o
     * @return {Boolean}
     */

    function $support(interface_, o) {
        if(o.__interfaces__ && o.__interfaces__.indexOf(interface_) != -1) {
            return true;
        }

        for(var k in interface_) {
            //ignore meta member that likes __proto__
            if(/^__.*__$/.test(k))continue;
            
            if($is(Array, interface_[k])) {
                if(!$is("function", o[k])) {
                    return false;
                }
            } else {
                if(!$is(interface_[k], o[k])) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * implement a interface
     * @memberof M
     * @argu  {Interface} interface_
     * @argu  {Object} obj
     */

    function $implement(obj, interface_) {
        var interfaces = obj.__interfaces__ || (obj.__interfaces__ = []);
        if(interfaces.indexOf(interface_) == -1) {
            if(!$support(interface_, obj)) {
                throw "interface not supported";
            }

            //write arguments meta for methods of obj
            Object.keys(interface_).forEach(function(p) {
                if($is(Array, interface_[p])) {
                    obj[p].__argu_types__ = _parseArguTypes(interface_[p]);
                }
            });

            interfaces.push(interface_);
        }
    }

    function $checkArgu() {
        var caller = arguments.callee.caller;
        var args = caller["arguments"];
        var arguTypes;
        if(arguments.length === 0) {
            arguTypes = caller.__argu_types__;
        } else {
            arguTypes = _parseArguTypes(Array.prototype.slice.call(arguments), parseArguNames(caller));
        }
        var type;

        for(var i = 0, l = arguTypes.length; i < l; i++) {
            type = arguTypes[i].type;
            //将方法的参数声明为undefined类型，表明其可为任何值，所以总是验证通过
            if(type === undefined) return true;
            if(!$is(type, args[i])) {
                return false;
            }
        }
        return true;
    }

    M.parseArguNames = parseArguNames;
    M.Interface = Interface;

    M.$interface = $interface;
    M.$support = $support;
    M.$implement = $implement;
    M.$is = $is;
    M.$checkArgu = $checkArgu;
    M.$func = $func;
}, Mayjs);

/**
 * @require M.util
 * @require M.MObjectUtil
 */


Mayjs.util.run(function(M) {
    /**
     * 定义一个module
     * @memberof M
     * @param  {Object} o
     * @return {Object}
     */

    function $module(o) {
        return o;
    }

    /**
     * include module to obj with option
     * @memberof M
     * @param  {Object} opt.module
     * @param  {Object} opt.to
     * @param  {Object} opt.option
     * @return {Object}
     */

    function $include(obj, module, option) {
        var defauls = {
            "methodize": false,
            "context": null, //methodize的参数
            "methodizeTo": null, //methodize的参数
            //"alias": null 
            //"forceInclude": false
        };

        option = M.MObjectUtil.merge(defauls, option);

        /*if(!obj.__modules__){
            obj.__modules__ = [];
        }

        不判断是否已经包含了
        var includedModules = _collectIncludedModules(obj);
        if(includedModules.indexOf(module) != -1 && !option.forceInclude){
            return;
        }
        */

        var needMethodize = option.methodize;

        M.MObjectUtil.eachOwn(module, function(k, v){
            if("onIncluded" != k && !k.match(/^__.*__$/)) {
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

        //_registIncludedModule(obj, module, includedModules);

        if(module.onIncluded) {
            module.onIncluded.call(obj, option.context || obj);
        }
    }

    /*
    var _collectIncludedModules = function(obj){
        var modules = obj.__modules__;
        traverseChain(obj, "__proto__", function(proto){
            modules.concat(proto.__modules__);
        });
        return modules;
    };

    var _registIncludedModule = function(obj, module, includedModules){
        var objModules = obj.__modules__;

        var moduleItsModules = module.__modules__ || [];

        moduleItsModules.concat([module]).forEach(function(m){
            if(includedModules.indexOf(m) == -1){
                objModules.push(m);
            }
        });
    };
    */

    M.$module = $module;
    M.$include = $include;
}, Mayjs);
/**
 * [base description]
 * @require M.MObjectUtil
 * @require M.interface
 * @type {Object}
 */

Mayjs.util.run(function(M) {
    var traverseChain = M.MObjectUtil.traverseChain;
    var mix = M.MObjectUtil.mix;



    var BaseObj = {
        __interfaces__: [],
        initialize: function(){
        },
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



    var BaseClass = function(){
    }

    BaseClass.prototype = BaseObj.extend({
        extendClass : function(classDefine){
            var proto = this.prototype.extend(classDefine);

            var klass;
            if(!Object["__proto__"]) {//for IE browser
                klass = function(){
                    this["__proto__"] = proto;
                    if(proto.hasOwnProperty("initialize")){
                        proto.initialize.apply(this, arguments);
                    }
                }
            }else{
                klass = function(){
                    if(proto.hasOwnProperty("initialize")){
                        proto.initialize.apply(this, arguments);
                    }
                }
            }

            klass.prototype = proto;
            klass.extend = BaseClass.extend;

            return klass;
        }
    });

    BaseClass.extend = function(classDefine){
       return this.prototype.extendClass.apply(this, arguments); 
    }

    BaseClass = BaseClass.extend({
        initialize: function(){
            this.__interfaces__ = [];
            this.base(); //call BaseObj.initialize
        }
    })



    /**
     * @memberof M
     * @type {Interface}
     */
    var IBase = M.$interface({
        "initialize": [],
        "base": [],
        "__interfaces__": Array
    });

    M.$implement(BaseObj, IBase);



    function $class(prototype){
        return BaseClass.extend(prototype);
    }

    function $obj(obj){
        return BaseObj.extend(obj);
    }



    M.IBase = IBase;
    M.BaseObj = BaseObj;
    M.BaseClass = BaseClass;
    M.$class = $class;
    M.$obj = $obj;
}, Mayjs);
/**
 * 新建并返回对象的代理，该代理包含了对象原型的扩展模块<br/>
 * !!!为了JSDoc能够生成文档而标记为一个类，不要使用new $()调用。
 * @require M.util
 * @require M.module
 * @require M.MObjectUtil
 * @memberof M
 * @class
 */
Mayjs.util.run(function(M) {
    var toObject = M.util.toObject;
    var merge = M.MObjectUtil.merge;
    var mix = M.MObjectUtil.mix;

    var Wrapper = M.$class({
        initialize: function() {
            this.__map__ = [];

            this.$ = this.$.bind(this);
            this.$.$$ = this.$$.bind(this);
            this.$.use = this.use.bind(this);
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
        $: function(obj) {
            return this.__wrap(obj, {}, {context: obj});
        },

        /**
         * 给对象包含对象原型的扩展模块，并返回对象自己
         * 如果对象是值类型，会新建一个它对应的引用类型对象，包含扩展模块后返回
         * @memberof M
         * @param {Object} obj 对象
         * @param {Object}
         */

        $$: function(obj) {
            return this.__wrap(obj);
        },

        /**
         * 注册一个prototype或interface_或value object的扩展模块
         * @memberof M.$
         * @param {Object} module
         * @param {Object|Interface|String} type
         * @param {Object} [includeOption]
         */
        use: function(module, includeOption) {
            var type = module.__this__;

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

            return this;
        },

        /**
         * 从字典中查找prototype|interface_|value type的注册扩展模块
         * @memberof M.$
         * @param {Object|Interface|String} type
         * @return {Array}
         */
        __findWrappersByType: function(type) {
            var ms = this.__map__.filter(function(item) {
                return item.type == type;
            });
            return ms.length === 0 ? [] : ms[0].modules;
        },

        /**
         * 查找对象原型链的扩展模块
         * @memberof M.$
         * @param {Object} proto 对象的原型
         * @return {Array}
         */
        __findWrappersByPrototype: function(proto) {
            var wrappers = [];
            var oldProto;

            while(proto) {
                wrappers = wrappers.concat(this.__findWrappersByType(proto));
                if(proto.hasOwnProperty("__interfaces__")){
                    proto.__interfaces__.forEach(function(interface_) {
                        wrappers = wrappers.concat(this.__findWrappersByType(interface_));
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

        /**
         * 查找对象的扩展模块
         * @memberof M.$
         * @param {Object|Interface|String} obj
         * @return {Array}
         */
        __findWrappersByObj: function(obj) {
            if(obj === null) return [];

            var wrappers = [];
            var addTypeWrappers = function(type) {
                    wrappers = wrappers.concat(this.__findWrappersByType(type));
                };

            var objType = typeof obj;
            if(objType == "object" || objType == "function") { //reference type
                wrappers = wrappers.concat(this.__findWrappersByPrototype(obj["__proto__"] || obj.constructor.prototype));
                if(obj.hasOwnProperty("__interfaces__")){
                    obj.__interfaces__.forEach(function(interface_) {
                        addTypeWrappers(interface_);
                    });
                }
            } else { //value type
                addTypeWrappers(objType);
            }

            return wrappers;
        }
    });



    M.Wrapper = Wrapper;
    M.$ = function(){
        return (new this.Wrapper()).$;
    }
}, Mayjs);