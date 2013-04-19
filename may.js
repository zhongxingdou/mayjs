(function(HOST) {
    /** @namespace Mayjs  */
    var Mayjs = {};
    
    /**
     * @namespace Mayjs.$meta
     */
    var $meta = {
        _parseName: function(name){
            if(!/^__.*__$/.test(name)){
                name = "__" + name + "__";
            }
            return name;
        },
        /**
         * meta是否存在
         * @memberof Mayjs.$meta
         * @param  {Object}  obj
         * @param  {String}  name
         * @return {Boolean}
         */
        has: function(obj, name){
            return obj.hasOwnProperty(this._parseName(name));
        },
        /**
         * get meta form obj
         * @memberof Mayjs.$meta
         * @param  {Object}  obj
         * @param  {String}  name
         */
        get: function(obj, name){
            return obj[this._parseName(name)];
        },
        /**
         * set meta of obj
         * @memberof Mayjs.$meta
         * @param {Object} obj
         * @param {String} name meta name
         * @param {Object} value meta value
         * @param {Boolean} [readonly=false]
         */
        set: function (obj, name, value, readonly){
            Object.defineProperty(obj, this._parseName(name), {
                value: value,
                writable: readonly !== true
            });
        }
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
        return HOST.hasOwnProperty ? HOST.hasOwnProperty(globalName) : typeof HOST[globalName] !== "unconfigd";
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
        var keys = $meta.get(obj, "dsl") || Object.keys(obj);
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

        if($meta.has("protocols")) {
            $meta.get("protocols").forEach(function(protocol) {
                $implement(protocol, obj);
            });
        }

        if(module.onIncluded) {
            module.onIncluded.call(obj, option.context);
        }
    }

    /**
     * implement a protocol
     * @memberof Mayjs
     * @param  {Protocol} protocol
     * @param  {Object} obj
     */
    function $implement(protocol, obj) {
        if(!$meta.has(obj, "protocols")){
            $meta.set(obj, "protocols", []);
        }

        var protocols = $meta.get(obj, "protocols");
        if(protocols.indexOf(protocol) == -1) {
            if(!$support(protocol, obj)){
                throw "Not support protocol";
            }
            protocols.push(protocol);
        }
    }

    var _clazzExtend = function(config){
        return $extend(this.prototype, config);
    };

    function $safeCall(obj, method, args){
        if(obj && $is("function", obj[method])){
            return obj[method].apply(obj, args);
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

        //initialize clazz.prototype's protocols meta
        $meta.set(proto, "protocols", []);

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
            $meta.set(this, "protocols", []);
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
                if((proto = $meta.get(callerOwner, "proto"))){
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

            var base = callerOwner ? $meta.get(callerOwner, "proto") : null;
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
         * implement a protocol
         * @param  {Protocol} protocol
         * @return {Object} this
         */
        implement: function(protocol) {
            $implement(protocol, this);
            return this;
        },
        /**
         * 判断对象是否支持指定协议
         * @param  {Protocl} protocol
         * @return {Boolean}
         */
        supported: function(protocol) {
            return this.meta("protocols").indexOf(protocol) != -1;
        },
        /**
         * 获取对象的meta值
         * @param  {String} name
         * @return {Object}
         */
        meta: function(name){
            return $meta.get(this, name);
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
     * interface
     * @memberof Mayjs
     * @class
     * @type {Base}
     */
     var Protocol = Base.extend({
        initialize: function(o) {
            $mix(o, this);
        }
    });

    /**
     * 创建Protocol的快捷方法
     * @memberof Mayjs
     * @param  {Object} o protocol description
     * @return {Protocol}
     */
     function $protocol(o) {
        return new Protocol(o);
    }

    /**
     * @memberof Mayjs
     * @type {Protocol}
     */
     var IBase = $protocol({
        "initialize": [],
        "include": [{"module": Object}, {"[includeOption]":Object}],
        /*
        "method": [{
            "opt1": [Object, Array],
            "opt2": Object,
            "opt3": Object
        }],*/
        "implement": [Protocol],
        "__protocols__": Array
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
            if(Protocol.isPrototypeOf(type)) {
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
     * @param  {Protocol} protocol
     * @param  {Object} o
     * @return {Boolean}
     */
     function $support(protocol, o) {
        if($meta.has(o, "protocols") && $meta.get(o, "protocols").indexOf(protocol) != -1) {
            return true;
        }

        if(protocol["@base"] && !$support(protocol["@base"], o)) {
            return false;
        }

        var keys = Object.keys(protocol).filter(function(k) {
            return k !== "@base";
        });

        return keys.every(function(k) {
            if($is(Array, protocol[k])){
                return $is("function", o[k]);
            }else{
                return $is(protocol[k], o[k]);
            }
        });
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
     * 从字典中查找prototype|protocol|value type的注册扩展模块
     * @memberof Mayjs.$
     * @param {Object|Protocol|String} type
     * @return {Array}
     */
    $.findWrappersByType = function(type){
        return $meta.get($, "map")[type] || [];
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
     * @param {Object|Protocol|String} obj
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
            if($meta.has(obj, "protocols")){
                $meta.get(obj, "protocols").forEach(function(protocol){
                    addTypeWrappers(protocol);
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
     * @param  {Object|Protocol|String} type
     * @param  {Object} module 作为wrapper的module
     * @return {Boolean} 是否已经注册
     */
    $.exists = function(type, module){
        var wrappers = $meta.get($, "map")[type];
        if(!wrappers || wrappers.length < 1){
            return false;
        }else{
            return wrappers.filter(function(w){
                return w.module == module;
            }).length > 0;
        }
    };

    /**
     * 注册一个prototype或protocol或value object的扩展模块
     * @memberof Mayjs.$
     * @param {Object} module
     * @param {Object|Protocol|String} type
     * @param {Object} [includeOption]
     */
    $.regist = function(type, module, includeOption){
        if($is("function", type)){
            type = type.prototype;
        }

        if(!type || ["string","object"].indexOf(typeof type) == -1)return;
        if(typeof module != "object")return;

        var map  = $meta.get($, "map");
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

    var _dispatch = function(overloads, args){
        var l = args.length;

        var matches = overloads.filter(function(o){
            return o.paramTypes.length >= l;
        });
        if(matches.length <= 1)return matches[0];

        var orderedMatches = matches.sort(function(m1, m2){
            return m1.paramTypes.length - m2.paramTypes.length;
        });

        return orderedMatches.filter(function(m){
            for(var i=0; i<l; i++){
                if(!$is(m.paramTypes[i], args[i])){
                    return false;
                }
            }
            return true;
        })[0];
    };

    /**
     * function overload
     * @memberof Mayjs
     * @param {Array[]} overload functions and its params type
     * @return {Function}
     * @example
     *   fn = Mayjs.overload([["string","number"], function(name, age){
     *       return "I'm "+name+ " and I'm " + age + " years old";
     *   }], [["string"], function(name){
     *       return "i'm " + name;
     *   }]);
     *
     *   fn.overload(["string", "string"], function(name, interest){
     *       return "I'm " + name + ", and i'm interesting "+ interest;
     *   });
     *
     *   fn("lily");
     *   fn("lily", 18);
     *   fn("lily", "singing");
     */
    var $overload = function (/* [[String, Number], fn1], [[Protocol, String], fn2] */){
        //存储重载的方法
        var _overloads = $parseArray(arguments).map(function(overload){
            return {
                fn: overload[1],
                paramTypes: overload[0]
            };
        });

        var main = function(){
            var args = arguments;
            var fn = _dispatch(_overloads, args);
            if(fn && fn.fn){
                return fn.fn.apply(this, args);
            }
        };

        main.overload = function(paramTypes, fn){
            _overloads.push({
                fn: fn,
                paramTypes: paramTypes
            });
        };

        return main;
    };

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
     "$merge", "$implement", "$include", "$protocol", "$is", "$support", "$dsl", "$overload",
     "$", "$$", "$enum", "$global", "$meta", "$extend", "IBase", "Base", "Protocol"];
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
