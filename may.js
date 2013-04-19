(function(HOST) {
    /** @namespace Mayjs  */
    var Mayjs = {};

    function _parseArgsMeta(argsDefine, paramNames){
        var meta = [];
        if($is(Array, argsDefine)){//在$interface中声明成员方法的参数类型时，总是使用数组
            var l = argsDefine.length;
            var i;
            if(paramNames){//$def声明时带了方法定义，参数类型声明中无参数名项，参数名列表从方法定义中获取
                for(i=0; i<l; i++){
                    meta.push({
                        "name": paramNames[i],
                        "type": argsDefine[i]
                    });
                }
            }else{//在$interface中声明成员方法的参数类型时，需要指定对映参数名，故无须提供参数名列表
                for(i=0; i<l; i+=2){
                    meta.push({
                        "name": argsDefine[i],
                        "type": argsDefine[i+1]
                    });
                }
            }
        }else{//在$def中定义的option,即$def({param1: Type1, param2: Type2}, function(param1, param2){});
            meta.push({
                "name": paramNames[0],
                "type": $interface(argsDefine)
            });
        }
        return meta;
    }

    var _parseParamNames = function(fn){
        var m = fn.toString().match(/.*?\((.*)?\)/);
        if(m && m[1]){
            return m[1].split(",");
        }
        return [];
    };

    function $def(argsDefine, fn){
        $meta.set(fn, "paramspec", _parseArgsMeta(argsDefine, _parseParamNames(fn)));
        return fn;
    }

    var _parseMetaName = function(name){
        if(!/^__.*__$/.test(name)){
            name = "__" + name + "__";
        }
        return name;
    };

    var $meta = function(obj, name){
        return arguments.callee.get(obj, name);
    };

    /**
     * set meta of obj
     * @memberof Mayjs.$meta
     * @function set
     * @param {Object} obj
     * @param {String} name meta name
     * @param {Object} value meta value
     * @param {Boolean} [readonly=false]
     */
    $meta.set = function(obj, name, value, readonly){
        Object.defineProperty(obj, _parseMetaName(name), {
            value: value,
            writable: readonly !== true
        });
    };

    /**
     * get meta form obj
     * @function get
     * @memberof Mayjs.$meta
     * @param  {Object}  obj
     * @param  {String}  name
     */
    $meta.get = function(obj, name){
        return obj[_parseMetaName(name)];
    };

    /**
     * meta是否存在
     * @memberof Mayjs.$meta
     * @param  {Object}  obj
     * @param  {String}  name
     * @return {Boolean}
     */
    $meta.has = function(obj, name){
        return obj.hasOwnProperty(_parseMetaName(name));
    };

    /**
     * 定义一个全局变量，如果已经定义了同名全局变量，将抛出错误<br>
     * !!!为了JSDoc能够生成文档而标记为一个类，不要使用new Mayjs.$global()调用。
     * @class Mayjs.$global
     * @param  {String} globalName variable name
     * @param  {Object} [obj]
     */
    function $global(globalName, obj){
        if($global.exists(globalName)){
            throw globalName + " has configd";
        }else{
            var o = obj || eval(globalName);
            HOST[globalName] = o;

            var variables = $global["@variables"];
            if(variables.indexOf(globalName) == -1){
                variables.push(globalName);
            }
        }
    }

    /**
     * 判断全局变量是否已经定义
     * @memberof Mayjs.$global
     * @param  {String} globalName variable name
     * @return {Boolean}
     */
    $global.exists = function(globalName){
        return HOST.hasOwnProperty ? HOST.hasOwnProperty(globalName) : typeof HOST[globalName] !== "undefined";
    };

    $global["@variables"] = [];

    /**
     * 删除一个全局变量，并移除注册信息
     * @memberof Mayjs.$global
     * @param  {String} globalName variable name
     * @return {Boolean} 删除成功返回true，变量不存在或删除失败返回false
     */
    $global.del = function(globalName){
        var i = $global["@variables"].indexOf(objName);
        if(i >= 0){
            var variables = $global["@variables"];
            if(i === 0){
                variables.shift();
            }else if(i == variables.length - 1){
                variables.pop();
            }else{
                $global["@variables"] = variables.slice(0, i) + variables.slice(i+1);
            }
            HOST[globalName] = null;
            delete HOST[globalName];
            return true;
        }
        return false;
    };

    /**
     * 列举被管理的全局变量名
     * @memberof Mayjs.$global
     * @return {String[]}
     */
    $global.list = function(){
        return [].concat($global["@variables"]);
    };

    $global("Mayjs", Mayjs);

    HOST.global = {};

    /**
     * 仅仅是运行一个方法，避免暴露全局变量
     * @memberof Mayjs
     * @param  {Function} fn
     * @param  {Object}   context 作为当前对象的对象
     * @return {Object}
     */
    function $run(fn, context) {
        return fn.call(context || {});
    }
    $global("$run", $run);

    /**
     * 调用方法自身
     * @memberof Mayjs
     * @return {Function}
     */
    function $fn(){
        return arguments.callee.caller.apply(this, arguments);
    }

    /**
     * 将类Array对象转换成Array
     * @memberof Mayjs
     * @param  {Object} arrayLikeObj
     * @return {Array}
     */
    function $parseArray(arrayLikeObj){
        return Array.prototype.slice.call(arrayLikeObj, 0);
    }

    /**
     * 根据指定属性来追溯
     * @memberof Mayjs
     * @param {Object} o 对象
     * @param {String} prop 属性名
     * @param {Function} fn(a) 处理函数(追溯到的对象)
     * @return Boolean 全部处理完则返回true，中途结果返回false
     */
    function $trace(o, prop, fn) {
        var a = o;
        while (a) {
            if (fn(a) === false) return false;
            a = a[prop];
        }
        return true;
    }

    /**
     * 生成供eval()函数将指定变量成员声明为当前作用域内变量的代码
     * @memberof Mayjs
     * @param  {String} [obj=this]
     * @return {String}
     * @example
     * var Calculator = {
     *     add: function(a, b){ return a + b },
     *     sub: function(a, b){ return a - b }
     * }
     *
     * eval(dsl(Calculator));
     *
     * add(4, 6);
     * sub(10, 4);
     */
     function $dsl(obj) {
        obj = obj || this;

        //create global tempObj
        var tempVarName = "_temp" + Date.now();
        eval(tempVarName + "={value: {}}");

        //get tempObj and set it's value with obj
        var temp = eval(tempVarName);
        temp.value = obj;

        //generate members declare string
        var keys = $meta(obj, "dsl") || Object.keys(obj);
        var members = keys.map(function(name) {
            return name + "=" + tempVarName + ".value" + "['" + name + "']";
        });
        return "var " + members.join(",") + "; delete " + tempVarName;
    }

    /**
     * 将普通函数包装成一个方法，函数的第一个参数指向this
     * @memberof Mayjs
     * @param  {Function} fn pure function
     * @param  {Object}   [context=this] 第一个参数绑定到的对象
     * @param  {Function} [methodizeTo] 从context获取绑定对象的方法
     * @return {Function}
     */
     function $methodize(fn, context, methodizeTo) {
        return function() {
            context = context || this;
            var args = [ methodizeTo ? methodizeTo(context) : context].concat($parseArray(arguments));
            return fn.apply(null, args);
        };
    }

    /**
     * 定义一个module
     * @memberof Mayjs
     * @param  {Object} o
     * @return {Object}
     */
     function $module(o) {
        return o;
    }

    /**
     * clone object
     * @memberof Mayjs
     * @param  {Object} o    被克隆的对象
     * @param  {Boolean} [deep=false] 是否深度克隆
     * @return {Object}      o的克隆
     */
    function $clone(o, deep){
        var obj = {};
        for(var p in o){
            obj[p] = deep ? $clone(o[p]) : o[p];
        }
        return obj;
    }

    /**
     * copy members of src to dest
     * @memberof Mayjs
     * @param  {Object} src [description]
     * @param  {Object} dest [description]
     * @param  {String[]} [whitelist=null] 不想被覆盖的成员
     * @return {Object}
     */
    function $mix(src, dest, whitelist){
        if(!src)return dest;
        var p;
        if(whitelist && whitelist.length > 0){
            for(p in src){
                if(whitelist.indexOf(p) == -1){
                    dest[p] = src[p];
                }
            }
        }else{
            for(p in src){
                dest[p] = src[p];
            }
        }
        return dest;
    }

    /**
     * merge a to b
     * @memberof Mayjs
     * @param {Object} a
     * @param {Object} b
     * @param  {String[]} [whitelist=null] 不想被覆盖的成员
     * @return {Object} merge result
     */
     function $merge(a, b, whitelist) {
        var obj = $clone(b);
        $mix(a || {}, obj, whitelist);
        return obj;
    }

    /**
     * include module to obj with option
     * @memberof Mayjs
     * @param  {Object} module
     * @param  {Object} obj
     * @param  {Object} [option]
     * @return {Object}
     */
    function $include(module, obj, option) {
        var defauls = {
            "methodize": false,
            "context": obj,
            "methodizeTo": null,
            "alias": null
        };
        option = $merge(option, $merge(module.includeOption, defauls));

        var methodizeIt = option.methodize;
        Object.keys(module).forEach(function(p){
            var alias = option.alias && option.alias[p] ? option.alias[p] : p;
            if(!(/^__.*__$/.test(p)) && ["onIncluded","includeOption"].indexOf(p) == -1) {
                var mp = module[p];
                if(methodizeIt && typeof mp == "function") {
                    obj[alias] = $methodize(mp, option.context, option.methodizeTo);
                } else {
                    obj[alias] = module[p];
                }
            }
        });

        if($meta.has("interfaces")) {
            $meta("interfaces").forEach(function(interface_) {
                $implement(interface_, obj);
            });
        }

        if(module.onIncluded) {
            module.onIncluded.call(obj, option.context);
        }
    }

    /**
     * implement a interface
     * @memberof Mayjs
     * @param  {Interface} interface_
     * @param  {Object} obj
     */
    function $implement(interface_, obj) {
        if(!$meta.has(obj, "interfaces")){
            $meta.set(obj, "interfaces", []);
        }

        var interfaces = $meta(obj, "interfaces");
        if(interfaces.indexOf(interface_) == -1) {
            if(!$support(interface_, obj)){
                throw "Not support interface_";
            }

            //write arguments meta for methods of obj
            Object.keys(interface_).forEach(function(p){
                if($is(Array, interface_[p])){
                    $meta.set(obj[p], "paramspec", _parseArgsMeta(interface_[p]));
                }
            });

            interfaces.push(interface_);
        }
    }

    var _clazzExtend = function(config){
        return $extend(this.prototype, config);
    };

    function $safeCall(obj, method, args, context){
        if(obj && $is("function", obj[method])){
            return obj[method].apply(context || obj, args);
        }
    }

    function $extend(baseProto, config){
        var clazz = function(){
            var initialize = clazz.prototype.initialize;
            if(initialize){
                initialize.apply(this, arguments);
            }
        };

        ["implement","support","include"].forEach(function(p){
            clazz[p] = function(){
                $safeCall(clazz.prototype, p, arguments);
            };
        });

        $meta.set(clazz, "config", config, true);

        var proto = Object.create(baseProto);

        //link to base prototype in IE
        if(!proto["__proto__"]){
            $meta.set(proto, "proto", baseProto, true);
        }

        //copy statics member to clazz
        var statics = config["@statics"];
        if(statics){
            $mix(statics, clazz);
        }

        if(!clazz.extend){
            clazz.extend = _clazzExtend;
        }
        

        clazz.prototype = proto;

        //copy prototype member of config to clazz.prototype
        var defineProto = Object.keys(config).filter(function(name){
            return name.charAt(0) != "@" && name != "constructor";
        });
        defineProto.forEach(function(p){
            proto[p] = config[p];
        });

        //initialize clazz.prototype's interfaces meta
        $meta.set(proto, "interfaces", []);

        return clazz;
    }

     /**
      * @lends Mayjs.Base.prototype
      */
    var Base = $extend(Object.prototype, {
        "@statics": {
            "extend": function(config){
                if(!config.initialize){
                    config.initialize = function(){
                        this.base();
                    };
                }
                return $extend(this.prototype, config);
            }
        },
        /**
         * initialize instance of this prototype <br>
         * 使用Mayjs.Base.create()或Mayjs.$obj()来创建实例，
         * @constructs
         * @see Mayjs.$obj
         */
        "initialize": function() {
            $meta.set(this, "interfaces", []);
        },
        _callerOwner: function(caller){
            var callerOwner = null;
            $trace(this, "__proto__", function(proto){
                Object.keys(proto).forEach(function(p){
                    if(proto[p] == caller){
                        callerOwner = proto;
                        caller["@name"] = p;
                        return false;
                    }
                });
                if(callerOwner)return false;
            });
            return callerOwner;
        },

        //返回此方法的调用者的拥有者(prototype)
        //此方法不可像this.proto().proto()这样用，请像this.proto().__proto__
        /**
         * get member from base prototype
         * @param  {String} member member name
         * @return {Object}
         */
        protoMember: function(member){
            var callerOwner = this._callerOwner(arguments.callee.caller);
            if(callerOwner){
                var ptoto;
                if((proto = $meta(callerOwner, "proto"))){
                    return proto[member];
                }
            }
        },
        /**
         * 类似C#的base()和Java的super()，获取调用此方法的方法名，在对象的base prototype中调用这个方法
         * @return {Object}
         */
        base: function(){
            var caller = arguments.callee.caller;
            var callerOwner = this._callerOwner(caller);

            var callerName = caller["@name"];
            delete caller["@name"];

            var base = callerOwner ? $meta(callerOwner, "proto") : null;
            var fn = base ? base[callerName] : null;

            if($is("function",fn)){
                return fn.apply(this, arguments);
            }
        },
        /**
         * include a module
         * @param  {Object} module
         * @param  {Object} [option]
         * @return {Object} this
         */
        include: function(module, option) {
            $include(module, this, option);
            return this;
        },
        /**
         * implement a interface_
         * @param  {Interface} interface_
         * @return {Object} this
         */
        implement: function(interface_) {
            $implement(interface_, this);
            return this;
        },
        /**
         * 判断对象是否支持指定协议
         * @param  {Protocl} interface_
         * @return {Boolean}
         */
        supported: function(interface_) {
            return this.meta("interfaces").indexOf(interface_) != -1;
        },
        /**
         * 获取对象的meta值
         * @param  {String} name
         * @return {Object}
         */
        meta: function(name){
            return $meta(this, name);
        },
        /**
         * dsl
         * @function
         * @see Mayjs.$dsl
         */
        dsl: $dsl
    });

    /**
     * 创建Base的便捷方法
     * @memberof Mayjs
     * @param  {Object} a
     * @return {Base}
     */
     function $obj(a) {
        var o = new Base();
        $mix(a, o);
        return o;
    }

    /**
     * interface prototype
     * @memberof Mayjs
     * @type {Object}
     */
     var Interface = {};

    /**
     * 创建Interface的快捷方法
     * @memberof Mayjs
     * @param  {Object} define interface define
     * @param  {Interface} base base interface
     * @return {Interface}
     */
     function $interface(define, base) {
        var interface_;
        if(base){
            if(!Interface.isPrototypeOf(base))throw "Parameter base is not an Interface";
            interface_ = Object.create(base);
        }else{
            interface_ = Object.create(Interface);
        }
        $mix(define, interface_);
        return interface_;
    }

    /**
     * @memberof Mayjs
     * @type {Interface}
     */
     var IBase = $interface({
        "initialize": [],
        "include": ["module:", Object, "[includeOption]:", Object],
        /*
        "method": [{
            "opt1": [Object, Array],
            "opt2": Object,
            "opt3": Object
        }],*/
        "implement": ["interface:", Interface],
        "__interfaces__": Array
    });

     Base.implement(IBase);

    /**
     * 对象类型判断
     * @memberof Mayjs
     * @param  {Object|String}  type
     * @param  {Object}  o
     * @return {Boolean}
     */
     function $is(type, o) {
        if(type === null) return o === null;
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

    /**
     * 判断一个对象是否支持指定协议
     * @memberof Mayjs
     * @param  {Interface} interface_
     * @param  {Object} o
     * @return {Boolean}
     */
     function $support(interface_, o) {
        if($meta.has(o, "interfaces") && $meta(o, "interfaces").indexOf(interface_) != -1) {
            return true;
        }

        for(var k in interface_){
           if($is(Array, interface_[k])){
                if(!$is("function", o[k])){
                    return false;
                }
            }else{
                if(!$is(interface_[k], o[k])){
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * 将一个值对象转换成引用对象
     * @memberof Mayjs
     * @param {Object} value
     * @return {Object}
     */
    function $toObject(value){
        var type = typeof value;
        var obj = value;
        if(["object","function"].indexOf(type) == -1){
            var Type = eval(type.charAt(0).toUpperCase() + type.slice(1));
            obj = new Type(value);
        }
        return obj;
    }


     /**
      * 新建并返回对象的代理，该代理包含了对象原型的扩展模块<br/>
      * !!!为了JSDoc能够生成文档而标记为一个类，不要使用new $()调用。
      * @memberof Mayjs
      * @class
      * @param {Object} obj 对象
      * @return {Object} 对象的代理
      */
    function $ (obj) {
        var wrappers = $.findWrappersByObj(obj);

        obj = $toObject(obj);

        if(wrappers.length === 0)return obj;

        var proxy = new Base();

        wrappers.forEach(function(wrapper){
            proxy.include(wrapper.module, $merge(wrapper.includeOption, {"context": obj}, ["context"]));
        });

        return proxy;
    }

    $meta.set($, "map", {});

    /**
     * 从字典中查找prototype|interface_|value type的注册扩展模块
     * @memberof Mayjs.$
     * @param {Object|Interface|String} type
     * @return {Array}
     */
    $.findWrappersByType = function(type){
        return $meta($, "map")[type] || [];
    };

    /**
     * 查找对象原型链的扩展模块
     * @memberof Mayjs.$
     * @param {Object} proto 对象的原型
     * @return {Array}
     */
    $.findWrappersByPrototype = function(proto){
        var wrappers = [];
        var oldProto;

        while(proto){
            wrappers = wrappers.concat($.findWrappersByType(proto));

            oldProto = proto;

            proto = oldProto.prototype || (oldProto.constructor ? oldProto.constructor.prototype : null);

            if(proto == oldProto){
                break;
            }
        }

        return wrappers;
    };

    /**
     * 查找对象的扩展模块
     * @memberof Mayjs.$
     * @param {Object|Interface|String} obj
     * @return {Array}
     */
    $.findWrappersByObj = function(obj){
        if(obj === null)return [];

        var wrappers = [];
        var addTypeWrappers = function(type){
            wrappers = wrappers.concat($.findWrappersByType(type));
        };

        var objType = typeof obj;
        if(objType == "object"){ //reference type
            wrappers = wrappers.concat($.findWrappersByPrototype(obj.prototype || obj.constructor.prototype));
            if($meta.has(obj, "interfaces")){
                $meta(obj, "interfaces").forEach(function(interface_){
                    addTypeWrappers(interface_);
                });
            }
        }else{ //value type
            addTypeWrappers(objType);
        }

        return wrappers;
    };

    /**
     * 判断一个module是否注册为指定type的wrapper
     * @memberof Mayjs.$
     * @param  {Object|Interface|String} type
     * @param  {Object} module 作为wrapper的module
     * @return {Boolean} 是否已经注册
     */
    $.exists = function(type, module){
        var wrappers = $meta($, "map")[type];
        if(!wrappers || wrappers.length < 1){
            return false;
        }else{
            return wrappers.filter(function(w){
                return w.module == module;
            }).length > 0;
        }
    };

    /**
     * 注册一个prototype或interface_或value object的扩展模块
     * @memberof Mayjs.$
     * @param {Object} module
     * @param {Object|Interface|String} type
     * @param {Object} [includeOption]
     */
    $.regist = function(type, module, includeOption){
        if($is("function", type)){
            type = type.prototype;
        }

        if(!type || ["string","object"].indexOf(typeof type) == -1)return;
        if(typeof module != "object")return;

        var map  = $meta($, "map");
        var modules = map[type];
        if(!modules){
            modules = map[type] = [];
        }

        if(!$.exists(type, module)){
            modules.push({
                "module": module,
                "includeOption": includeOption
            });
        }

        return this;
    };


    /**
     * 给对象包含对象原型的扩展模块，并返回对象自己
     * 如果对象是值类型，会新建一个它对应的引用类型对象，包含扩展模块后返回
     * @memberof Mayjs
     * @param {Object} obj 对象
     * @param {Object}
     */
    function $$ (obj) {
        var wrappers = $.findWrappersByObj(obj);

        obj = $toObject(obj);

        if(wrappers.length === 0)return obj;

        wrappers.forEach(function(wrapper){
            if(obj.include){
                obj.include(wrapper.module, wrapper.includeOption);
            }else{
                $include(wrapper.module, obj, wrapper.includeOption);
            }
        });

        return obj;
    }

    $mix($, $$);

    function $checkParams(fn, args){
        var caller = fn || arguments.callee.caller;
        args = args || caller["arguments"];
        var paramsMeta = $meta(fn, "paramspec");
        var type;
        for(var i=0, l=args.length; i<l; i++){
            type = paramsMeta[i].type;
            //将方法的参数声明为null类型，表明其可为任何值，所以总是验证通过
            if(type === null)return true;
            if(!$is(type, args[i])){
                return false;
            }
        }
        return true;
    }

    var _dispatch = function(overloads, args){
        var l = args.length;

        var argsMeta = function(fn){
            return $meta(fn, "paramspec");
        };

        var matches = overloads.filter(function(fn){
            return argsMeta(fn).length >= l;
        });
        if(matches.length <= 1)return matches[0];

        var orderedMatches = matches.sort(function(fn1, fn2){
            return argsMeta(fn1).length - argsMeta(fn2).length;
        });

        var fn;
        while((fn = orderedMatches.shift())){
            if($checkParams(fn, args)){
                return fn;
            }
        }
    };

    /**
     * function overload
     * @memberof Mayjs
     * @param {Array} paramsType params types
     * @param {Function} fn overload function
     * @return {Function}
     * @example
     *   fn = $overload(["string","number"], function(name, age){
     *       return "I'm "+name+ " and I'm " + age + " years old";
     *   }).$overload(["string"], function(name){
     *       return "i'm " + name;
     *   });
     *
     *   fn.$overload(["string", "string"], function(name, interest){
     *       return "I'm " + name + ", and i'm interesting "+ interest;
     *   });
     *
     *   fn("lily");
     *   fn("lily", 18);
     *   fn("lily", "singing");
     */

    function $overload (paramsType, fn){
        //存储重载的方法
        var _overloads = [$def(paramsType, fn)];

        var main = function(){
            var args = arguments;
            var fn = _dispatch(_overloads, args);
            if(fn){
                return fn.apply(this, args);
            }
        };

        main.$overload = function(argsMeta, fn){
            _overloads.push($def(argsMeta, fn));
            return this;
        };

        return main;
    }

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
    function $enum(names) {
        if ($is(Object, arguments[0])){
            return arguments[0];
        }

        var _enum = {};
        $parseArray(arguments).forEach(function(key){
            _enum[key] = {};
        });

        return _enum;
    }

    var fns = ["$run", "$fn", "$parseArray", "$trace", "$methodize", "$module", "$obj",
     "$merge", "$implement", "$include", "$interface", "$is", "$support", "$dsl", "$overload",
     "$", "$$", "$enum", "$global", "$meta", "$extend", "$checkParams", "IBase", "Base", "Interface"];
    fns.forEach(function(k) {
            Mayjs[k] = eval(k);
    });

    Mayjs.dsl = $dsl;

    $meta.set(Mayjs, "dsl", fns.filter(function(name){
        return name.charAt(0) === "$";
    }));

    if(!$global.exists("console")){
        var console = {};
        ["info","log","error","debug","warn","trace","dir"].forEach(function(name){
            console["name"] = function(){};
        });
        $global("console", console);
    }
})(this);
