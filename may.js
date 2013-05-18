(function(HOST) {
    /**
     * 定义一个全局变量，如果已经定义了同名全局变量，将抛出错误<br>
     * !!!为了JSDoc能够生成文档而标记为一个类，不要使用new Mayjs.global()调用。
     * $global(name)在非全局环境中也可以吗？
     * @class Mayjs.global
     * @param  {String} globalName variable name
     * @param  {Object} [obj]
     */

    var $global = function(globalName, obj) {
            if($global.defined(globalName)) {
                throw globalName + " defined";
            } else {
                var o = obj || eval(globalName);
                HOST[globalName] = o;

                var variables = $global.__variables__;
                if(variables.indexOf(globalName) == -1) {
                    variables.push(globalName);
                }
            }
        };

    /**
     * 判断全局变量是否已经定义
     * @memberof Mayjs.global
     * @param  {String} globalName variable name
     * @return {Boolean}
     */
    $global.defined = function(globalName) {
        return HOST.hasOwnProperty ? HOST.hasOwnProperty(globalName) : typeof HOST[globalName] !== "undefined";
    };

    Object.defineProperty($global, "__variables__", {
        value: [],
        writable: true
    });

    /**
     * 删除一个全局变量，并移除注册信息
     * @memberof Mayjs.global
     * @param  {String} globalName variable name
     * @return {Boolean} 删除成功返回true，变量不存在或删除失败返回false
     */
    $global.del = function(globalName) {
        var i = this.__variables__.indexOf(globalName);
        if(i >= 0) {
            var variables = this.__variables__;
            this.__variables__ = variables.slice(0, i) + variables.slice(i + 1);
        }
        HOST[globalName] = null;
        delete HOST[globalName];
    };

    /**
     * 列举被管理的全局变量名
     * @memberof Mayjs.global
     * @return {String[]}
     */
    $global.list = function() {
        return [].concat(this.__variables__);
    };


    if(typeof(console) == "undefined") {
        console = {};
        ["info", "log", "error", "debug", "warn", "trace", "dir"].forEach(function(name) {
            console["name"] = function() {};
        });
    }

    var $run = function(fn) {
            if(arguments.length == 1) {
                return fn();
            } else {
                return fn.apply(this, Array.prototype.slice.call(arguments, 1));
            }
        };

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

    var $dsl = function(obj) {
            obj = obj || this;

            //create global tempObj
            var tempVarName = "_temp" + Date.now();
            eval(tempVarName + "={value: {}}");

            //get tempObj and set it's value with obj
            var temp = eval(tempVarName);
            temp.value = obj;

            //generate members declare string
            var keys = Object.keys(obj).filter(function(k){
                 return obj.hasOwnProperty(k) && typeof obj[k] == "function";
            });

            var members = keys.map(function(name) {
                return name + "=" + tempVarName + ".value" + "['" + name + "']";
            });
            return "var " + members.join(",") + "; delete " + tempVarName;
        };

    $global("Mayjs", {
        "VERSION": 0.5,
        "$global": $global,
        "$run": $run,
        "HOST": HOST,
        "$dsl": $dsl
    });
})(this);Mayjs.util = Mayjs.$run(function(Mayjs) {
    return {
        forEach: function(obj, fn){
            for(var p in obj){
                if(obj.hasOwnProperty(p) && !(/^_/.test(p))){
                    if(fn(p, obj[p]) === false)break;
                }
            }
        },
        /**
         * 将一个值对象转换成引用对象
         * @memberof Mayjs
         * @param {Object} value
         * @return {Object}
         */
        toObject: function(value) {
            var type = typeof value;
            var obj = value;
            if(["object", "function"].indexOf(type) == -1) {
                var Type = eval(type.charAt(0).toUpperCase() + type.slice(1));
                obj = new Type(value);
            }
            return obj;
        },

        parseParamNames: function(fn) {
            var m = fn.toString().match(/.*?\((.*)?\)/);
            if(m && m[1]) {
                return m[1].split(",");
            }
            return [];
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
         * 根据指定属性来追溯
         * @memberof Mayjs
         * @param {Object} o 对象
         * @param {String} prop 属性名
         * @param {Function} fn(a) 处理函数(追溯到的对象)
         * @return Boolean 全部处理完则返回true，中途结果返回false
         */

        trace: function(o, prop, fn) {
            var a = o;
            while(a) {
                if(fn(a) === false) return false;
                a = a[prop];
            }
            return true;
        },

        /**
         * copy members of src to dest
         * @memberof Mayjs
         * @param  {Object} dest [description]
         * @param  {Object} src [description]
         * @param  {String[]} [whitelist=null] 不想被覆盖的成员
         * @return {Object}
         */

        mix: function(dest, src, whitelist) {
            if(!src) return dest;
            var p;
            if(whitelist && whitelist.length > 0) {
                for(p in src) {
                    if(whitelist.indexOf(p) == -1) {
                        dest[p] = src[p];
                    }
                }
            } else {
                for(p in src) {
                    dest[p] = src[p];
                }
            }
            return dest;
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

        "enum": function(names) {
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
         * clone object
         * @memberof Mayjs
         * @param  {Object} o    被克隆的对象
         * @param  {Boolean} [deep=false] 是否深度克隆
         * @return {Object}      o的克隆
         */

        clone: function(o, deep) {
            var obj = {};
            for(var p in o) {
                obj[p] = deep ? $clone(o[p]) : o[p];
            }
            return obj;
        },

        /**
         * 将普通函数包装成一个方法，函数的第一个参数指向this
         * @memberof Mayjs
         * @param  {Function} fn pure function
         * @param  {Object}   [context=this] 第一个参数绑定到的对象
         * @param  {Function} [methodizeTo] 从context获取绑定对象的方法
         * @return {Function}
         */

        methodize: function(fn, context, methodizeTo) {
            var slice = Array.prototype.slice;
            return function() {
                var obj = context || this;
                var args = [methodizeTo ? methodizeTo(obj) : obj].concat(slice.call(arguments, 0));
                return fn.apply(null, args);
            };
        },

        /**
         * merge a to b to c ... n
         * @memberof Mayjs
         * @param {Object} a
         * @param {Object} b
         * @return {Object} merge result
         */

        merge: function(a, b, c, n) {
            var util = Mayjs.util;
            var obj = {}, curr = null, p;

            for(var i=0,l=arguments.length; i<l; i++){
                curr = arguments[i];
                for(p in curr){
                    obj[p] = curr[p];
                }
            }

            return obj;
        }
    };
}, Mayjs);Mayjs.meta = Mayjs.$run(function() {
    var _parseMetaName = function(name) {
            if(!/^__.*__$/.test(name)) {
                name = "__" + name + "__";
            }
            return name;
    };

    return {
        /**
         * set meta of obj
         * @memberof Mayjs.$meta
         * @function set
         * @param {Object} obj
         * @param {String} name meta name
         * @param {Object} value meta value
         * @param {Boolean} [readonly=false]
         */
        set: function(obj, name, value, readonly) {
            Object.defineProperty(obj, _parseMetaName(name), {
                value: value,
                writable: readonly !== true
            });
        },

        /**
         * get meta form obj
         * @function get
         * @memberof Mayjs.$meta
         * @param  {Object}  obj
         * @param  {String}  name
         */
        get: function(obj, name) {
            return obj[_parseMetaName(name)];
        },

        /**
         * meta是否存在
         * @memberof Mayjs.$meta
         * @param  {Object}  obj
         * @param  {String}  name
         * @return {Boolean}
         */
        has: function(obj, name) {
            return obj.hasOwnProperty(_parseMetaName(name));
        }
    };
});/**
 * @require Mayjs.util
 * @require Maysj.meta
 */

Mayjs.$run(function(Mayjs) {
    var meta = Mayjs.meta;
    var util = Mayjs.util;

    var Interface = {};

    function _parseParamTypes(paramTypes, paramNames) {
        var meta = [];
        if($is(Array, paramTypes)) {
            var l = paramTypes.length;
            var i;
            if(paramNames) { //$def声明时带了方法定义，参数类型声明中无参数名项，参数名列表从方法定义中获取
                for(i = 0; i < l; i++) {
                    meta.push({
                        "name": paramNames[i],
                        "type": paramTypes[i]
                    });
                }
            } else { //在$interface中声明成员方法的参数类型时，需要指定对映参数名，故无须提供参数名列表
                for(i = 0; i < l; i += 2) {
                    meta.push({
                        "name": paramTypes[i],
                        "type": paramTypes[i + 1]
                    });
                }
            }
        } else { //在$def中定义的option,即$def({param1: Type1, param2: Type2}, function(param1, param2){});
            meta.push({
                "name": paramNames[0],
                "type": $interface(paramTypes)
            });
        }
        return meta;
    }

    function def(paramTypes, fn) {
        meta.set(fn, "param_types", _parseParamTypes(paramTypes, util.parseParamNames(fn)));
        return fn;
    }


    /**
     * 创建Interface的快捷方法
     * @memberof Mayjs
     * @param  {Object} define interface define
     * @param  {Interface} base base interface
     * @return {Interface}
     */

    function $interface (define, base) {
        if(base) {
            if(!Interface.isPrototypeOf(base)) throw "Parameter base is not an Interface";
            interface_ = Object.create(base);
        } else {
            interface_ = Object.create(Interface);
        }
        util.mix(interface_, define);
        return interface_;
    }

    /**
     * 对象类型判断
     * @memberof Mayjs
     * @param  {Object|String}  type
     * @param  {Object}  o
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

    /**
     * 判断一个对象是否支持指定协议
     * @memberof Mayjs
     * @param  {Interface} interface_
     * @param  {Object} o
     * @return {Boolean}
     */

    function $support(interface_, o) {
        if(meta.has(o, "interfaces") && meta.get(o, "interfaces").indexOf(interface_) != -1) {
            return true;
        }

        for(var k in interface_) {
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
     * @memberof Mayjs
     * @param  {Interface} interface_
     * @param  {Object} obj
     */

    function $implement(interface_, obj) {
        if(!meta.has(obj, "interfaces")) {
            meta.set(obj, "interfaces", []);
        }

        var interfaces = meta.get(obj, "interfaces");
        if(interfaces.indexOf(interface_) == -1) {
            if(!$support(interface_, obj)) {
                throw "Not support interface";
            }

            //write arguments meta for methods of obj
            Object.keys(interface_).forEach(function(p) {
                if($is(Array, interface_[p])) {
                    meta.set(obj[p], "param_types", _parseParamTypes(interface_[p]));
                }
            });

            interfaces.push(interface_);
        }
    }

    function $checkParams() {
        var caller = arguments.callee.caller;
        var args = caller["arguments"];
        var paramTypes;
        if(arguments.length === 0) {
            paramTypes = meta.get(caller, "param_types");
        } else {
            paramTypes = _parseParamTypes(util.parseArray(arguments), util.parseParamNames(caller));
        }
        var type;
        for(var i = 0, l = args.length; i < l; i++) {
            type = paramTypes[i].type;
            //将方法的参数声明为null类型，表明其可为任何值，所以总是验证通过
            if(type === null) return true;
            if(!$is(type, args[i])) {
                return false;
            }
        }
        return true;
    }

    Mayjs.$interface = $interface;
    Mayjs.$implement = $implement;
    Mayjs.$support = $support;
    Mayjs.$is = $is;
    Mayjs.$checkParams = $checkParams;
    Mayjs.util.def = def;
    Mayjs.Interface = Interface;
}, Mayjs);/**
 * @require Mayjs.meta
 * @require Mayjs.util
 * @require Mayjs.$interface
 */
Mayjs.$run(function(Mayjs) {
    var meta = Mayjs.meta;
    var util = Mayjs.util;

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
            "context": null,
            "methodizeTo": null,
            "alias": null
        };
        option = util.merge(defauls, option);

        var needMethodize = option.methodize;

        util.forEach(module, function(k, v){
            if("onIncluded" != k) {
                var name = (option.alias && option.alias[k]) ? option.alias[k] : k;
                if(needMethodize && typeof v == "function") {
                    obj[name] = util.methodize(v, option.context, option.methodizeTo);
                } else {
                    obj[name] = v;
                }
            }
        });

        if(meta.has("interfaces")) {
            meta.get("interfaces").forEach(function(interface_) {
                Mayjs.$implement(interface_, obj);
            });
        }

        if(module.onIncluded) {
            module.onIncluded.call(obj, option.context);
        }
    }

    Mayjs.$module = $module;
    Mayjs.$include = $include;
}, Mayjs);/**
 * [base description]
 * @require Mayjs.meta
 * @require Mayjs.util
 * @require Mayjs.core
 * @require Mayjs.interface
 * @type {Object}
 */

Mayjs.$run(function(Mayjs) {
    var meta = Mayjs.meta;
    var util = Mayjs.util;

    function $extend(baseProto, config) {
        var proto = Object.create(baseProto);
        var clazz;
        if(!Object["__proto__"]) {
            meta.set(proto, "proto", baseProto, true);
            clazz = function() {
                this["__proto__"] = proto;
                var initialize = clazz.prototype.initialize;
                if(initialize) {
                    initialize.apply(this, arguments);
                }
            };
        }else{
            clazz = function() {
                var initialize = clazz.prototype.initialize;
                if(initialize) {
                    initialize.apply(this, arguments);
                }
            };
        }

        // meta.set(clazz, "config", config, true);

        if(!clazz.extend) {
            var fn = arguments.callee;
            clazz.extend = function(config) {
                return fn(this.prototype, config);
            };
        }

        for(var p in config){
            var ap = config[p];
            if(typeof(ap) == "function"){
                meta.set(ap, "name", p);
            }
            proto[p] = ap;
        }

        meta.set(proto, "interfaces", []);

        clazz.prototype = proto;

        return clazz;
    }
    /**
     * @memberof Mayjs
     * @type {Interface}
     */
    var IBase = Mayjs.$interface({
        "initialize": [],
        "base": [],
        "__interfaces__": Array
    });

    /**
     * @lends Mayjs.Base.prototype
     */
    var Base = $extend(Object.prototype, {
        /**
         * initialize instance of this prototype <br>
         * 使用Mayjs.Base.create()或Mayjs.$obj()来创建实例，
         * @constructs
         * @see Mayjs.$obj
         */
        "initialize": function() {
            meta.set(this, "interfaces", []);
        },
        _callerOwner: function(caller, callerName) {
            var callerOwner = null;
            if(callerName){
                if(this["__proto__"][callerName] == caller){
                    return this["__proto__"];
                }
                util.trace(this, "__proto__", function(proto) {
                    if(proto.hasOwnProperty(callerName) && proto[callerName] == caller){
                        callerOwner = proto;
                        return false;
                    }
                });
            }else{
                util.trace(this, "__proto__", function(proto) {
                    Object.keys(proto).forEach(function(p) {
                        if(proto[p] == caller) {
                            callerOwner = proto;
                            meta.set(caller,"name", p);
                            return false;
                        }
                    });
                });
            }
            return callerOwner;
        },

        /**
         * 类似C#的base()和Java的super()，获取调用此方法的方法名，在对象的base prototype中调用这个方法
         * @return {Object}
         */
        base: function() {
            var caller = arguments.callee.caller;
            var callerName = caller.name || meta.get(caller, "name");
            var callerOwner = this._callerOwner(caller, callerName);
            if(!callerName)callerName = meta.get(caller, "name"); //在this._callerOwner方法中会为caller设置name meta;

            var base = callerOwner ? meta.get(callerOwner, "proto") : null;
            var fn = base ? base[callerName] : null;

            if(typeof fn == "function") {
                return fn.apply(this, arguments);
            }
        }
    });

    Mayjs.$implement(IBase, Base.prototype);

    Base.extend = function(config) {
        var o = $extend(this.prototype, config);
        if(!config.initialize) {
            o.prototype.initialize = function() {
                this.base();
            };
        }
        return o;
    };

    function $class(proto){
        return Base.extend(proto);
    }

    function $obj(obj){
        var o = new Base();
        util.mix(o, obj);
        return o;
    }


    Mayjs.$extend = $extend;
    Mayjs.Base = Base;
    Mayjs.IBase = IBase;
    Mayjs.$class = $class;
    Mayjs.$obj = $obj;
},Mayjs);/**
 * 新建并返回对象的代理，该代理包含了对象原型的扩展模块<br/>
 * !!!为了JSDoc能够生成文档而标记为一个类，不要使用new $()调用。
 * @require Mayjs.util
 * @require Mayjs.meta
 * @require Mayjs.base
 * @require Mayjs.module
 * @memberof Mayjs
 * @class
 * @param {Object} obj 对象
 * @return {Object} 对象的代理
 */

Mayjs.$run(function(Mayjs) {
    var util = Mayjs.util;
    var meta = Mayjs.meta;

    function $(obj) {
        obj = util.toObject(obj);
        var wrappers = arguments.callee.findWrappersByObj(obj);
        if(wrappers.length === 0) return obj;

        var proxy = {};
        
        wrappers.forEach(function(wrapper) {
            Mayjs.$include(wrapper.module, proxy, util.merge({
                "context": obj
            }, wrapper.includeOption));
        });

        return proxy;
    }

    meta.set($, "map", []);

    util.mix($, {

        /**
         * 从字典中查找prototype|interface_|value type的注册扩展模块
         * @memberof Mayjs.$
         * @param {Object|Interface|String} type
         * @return {Array}
         */
        findWrappersByType: function(type) {
            var ms = meta.get($, "map").filter(function(item){
                return item.type == type;
            });
            return ms.length === 0 ? [] : ms[0].modules;
        },

        /**
         * 查找对象原型链的扩展模块
         * @memberof Mayjs.$
         * @param {Object} proto 对象的原型
         * @return {Array}
         */
        findWrappersByPrototype: function(proto) {
            var wrappers = [];
            var oldProto;

            while(proto) {
                wrappers = wrappers.concat(this.findWrappersByType(proto));

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
         * @memberof Mayjs.$
         * @param {Object|Interface|String} obj
         * @return {Array}
         */
        findWrappersByObj: function(obj) {
            if(obj === null) return [];

            var wrappers = [];
            var addTypeWrappers = function(type) {
                    wrappers = wrappers.concat($.findWrappersByType(type));
                };

            var objType = typeof obj;
            if(objType == "object" || objType == "function") { //reference type
                wrappers = wrappers.concat($.findWrappersByPrototype(obj["__proto__"] || obj.constructor.prototype));
                if(meta.has(obj, "interfaces")) {
                    Maysj.meta.get(obj, "interfaces").forEach(function(interface_) {
                        addTypeWrappers(interface_);
                    });
                }
            } else { //value type
                addTypeWrappers(objType);
            }

            return wrappers;
        },

        /**
         * 判断一个module是否注册为指定type的wrapper
         * @memberof Mayjs.$
         * @param  {Object|Interface|String} type
         * @param  {Object} module 作为wrapper的module
         * @return {Boolean} 是否已经注册
         */
        exists: function(type, module) {
            return meta.get($, "map").filter(function(item){
                return item.type == type;
            }).filter(function(wrapper){
                return wrapper.module == module;
            }).length > 0;
        },

        /**
         * 注册一个prototype或interface_或value object的扩展模块
         * @memberof Mayjs.$
         * @param {Object} module
         * @param {Object|Interface|String} type
         * @param {Object} [includeOption]
         */
        regist: function(type, module, includeOption) {
            var $ = this;
            if(type != Function.prototype){// typeof Function.prototype == "function" true
                if(typeof type == "function") {
                    type = type.prototype;
                }

                if(type != Function.prototype){
                    if(!type || ["string", "object"].indexOf(typeof type) == -1) return;
                }
            }

            if(typeof module != "object") return;

            var map = meta.get($, "map");
            var typeWrappers = map.filter(function(item){
                return item.type == type;
            });

            var wrapper = {
                "module": module,
                "includeOption": includeOption
            };

            if(typeWrappers.length === 0) {
                typeWrappers = {"type": type, modules: [wrapper]};
                map.push(typeWrappers);
            }else{
                if(typeWrappers.modules.filter(function(wrapper){return wrapper.module == module;}).length === 0) {
                    typeWrappers.modules.push(wrapper);
                }
            }

            return this;
        }
    });


    /**
     * 给对象包含对象原型的扩展模块，并返回对象自己
     * 如果对象是值类型，会新建一个它对应的引用类型对象，包含扩展模块后返回
     * @memberof Mayjs
     * @param {Object} obj 对象
     * @param {Object}
     */

    function $$(obj) {
        obj = util.toObject(obj);
        var wrappers = $.findWrappersByObj(obj);
        if(wrappers.length === 0) return obj;

        wrappers.forEach(function(wrapper) {
            Mayjs.$include(wrapper.module, obj, wrapper.includeOption);
        });

        return obj;
    }

    Mayjs.$ = $;
    Mayjs.$$ = $$;
}, Mayjs);/**
 * [overload description]
 * @require Mayjs.meta
 * @require Mayjs.interface
 * @type {Object}
 */

Mayjs.$run(function(Mayjs) {
    var meta = Mayjs.meta;
    var util = Mayjs.util;

    function _checkParams(fn, params) {
        var caller = fn || arguments.callee.caller;
        var paramsMeta = meta.get(caller, "param_types");
        params = params || caller["arguments"];
        var type;
        for(var i = 0, l = params.length; i < l; i++) {
            type = paramsMeta[i].type;
            //将方法的参数声明为null类型，表明其可为任何值，所以总是验证通过
            if(type === null) return true;
            if(!Mayjs.$is(type, params[i])) {
                return false;
            }
        }
        return true;
    }

    function dispatch(overloads, params) {
        var l = params.length;

        var paramTypes = function(fn) {
                return meta.get(fn, "param_types");
            };

        var matches = overloads.filter(function(fn) {
            return paramTypes(fn).length >= l;
        });
        if(matches.length <= 1) return matches[0];

        var orderedMatches = matches.sort(function(fn1, fn2) {
            return paramTypes(fn1).length - paramTypes(fn2).length;
        });

        var fn;
        while((fn = orderedMatches.shift())) {
            if(_checkParams(fn, params)) {
                return fn;
            }
        }
    }


    /**
     * function overload
     * @memberof Mayjs
     * @param {Array} paramsTypes params types
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


    function $overload(paramTypes, fn) {
        //存储重载的方法
        var _overloads = [ typeof paramTypes == "function" ? paramTypes : util.def(paramsTypes, fn)];

        var main = function() {
                var params = arguments;
                var fn = dispatch(_overloads, params);
                if(fn) {
                    return fn.apply(this, params);
                }
            };

        main.overload = function(paramTypes, fn) {
            _overloads.push(typeof paramTypes == "function" ? paramTypes : util.def(paramTypes, fn));
            return this;
        };
        return main;
    }

    Mayjs.$overload = $overload;
}, Mayjs);Mayjs.$run(function(Mayjs) {
    var util = Mayjs.util;

    Mayjs.dsl = {
        $: Mayjs.$,
        $$: Mayjs.$$,
        $checkParams: Mayjs.$checkParams,
        $class: Mayjs.$class,
        $def: util.def,
        $enum: util["enum"],
        $fn: util.fn,
        $global: Mayjs.$global,
        $interface: Mayjs.$interface,
        $module: Mayjs.$module,
        $run: Mayjs.$run,
        $obj: Mayjs.$obj
    };
    
    Mayjs.DSL = Mayjs.$dsl(Mayjs.dsl);

    Mayjs.MFunction = Mayjs.$module({
        overload: function(fn, overFnparamTypes, overFn) {
            var main = Mayjs.$overload(fn);
            main.overload(overFnparamTypes, overFn);
            return main;
        },
        paramNames: function(fn) {
            return util.parseParamNames(fn);
        },
        methodize: util.methodize
    });

    Mayjs.MObject = Mayjs.$module({
        trace: util.trace,
        clone: util.clone,
        merge: util.merge,
        mix: util.mix,
        dsl: Mayjs.$dsl,
        meta: Mayjs.meta.get,
        setMeta: Mayjs.meta.set,
        hasMeta: Mayjs.meta.has,
        forEach: util.forEach,
        support: function(obj, interface_) {
            return Mayjs.$support(interface_, obj);
        },
        implement: function(obj, interface_) {
            return Mayjs.$implement(interface_, obj);
        },
        is: function(obj, type) {
            return Mayjs.$is(type, obj);
        },
        include: function(obj, module, option) {
            return Mayjs.$include(module, obj, option);
        }
    });

    Mayjs.init = function(option) {
        option = Mayjs.util.merge({
            "injectPrototype": true
        }, option);

        if(option.injectPrototype) {
            Mayjs.$include(Mayjs.MObject, Object.prototype, {
                "methodize": true,
                "context": null
            });
            Object.keys(Mayjs.MObject).forEach(function(k) {
                Mayjs.HOST[k] = undefined;
            });
            Mayjs.$include(Mayjs.MFunction, Function.prototype, {
                "methodize": true,
                "context": null
            });
        } else {
            Mayjs.$include(Mayjs.MObject, Mayjs.Base.prototype, {"methodize": true});

            Mayjs.$.regist(Object, Mayjs.MObject, {
                methodize: true
            });
            Mayjs.$.regist(Function, Mayjs.MFunction, {
                methodize: true
            });
        }
    };

}, Mayjs);