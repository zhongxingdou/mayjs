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
            var keys = Object.keys(obj);
            var members = keys.map(function(name) {
                return name + "=" + tempVarName + ".value" + "['" + name + "']";
            });
            return "var " + members.join(",") + "; delete " + tempVarName;
        };

    $global("Mayjs", {
        "$global": $global,
        "$run": $run,
        "HOST": HOST,
        "$dsl": $dsl
    });
})(this);Mayjs.util = Mayjs.$run(function(Mayjs) {
    return {
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
         * @param  {Object} src [description]
         * @param  {Object} dest [description]
         * @param  {String[]} [whitelist=null] 不想被覆盖的成员
         * @return {Object}
         */

        mix: function(src, dest, whitelist) {
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
                context = context || this;
                var args = [methodizeTo ? methodizeTo(context) : context].concat(slice.call(arguments, 0));
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

    function _parseArgsMeta(argsDefine, paramNames) {
        var meta = [];
        if($is(Array, argsDefine)) {
            var l = argsDefine.length;
            var i;
            if(paramNames) { //$def声明时带了方法定义，参数类型声明中无参数名项，参数名列表从方法定义中获取
                for(i = 0; i < l; i++) {
                    meta.push({
                        "name": paramNames[i],
                        "type": argsDefine[i]
                    });
                }
            } else { //在$interface中声明成员方法的参数类型时，需要指定对映参数名，故无须提供参数名列表
                for(i = 0; i < l; i += 2) {
                    meta.push({
                        "name": argsDefine[i],
                        "type": argsDefine[i + 1]
                    });
                }
            }
        } else { //在$def中定义的option,即$def({param1: Type1, param2: Type2}, function(param1, param2){});
            meta.push({
                "name": paramNames[0],
                "type": $interface(argsDefine)
            });
        }
        return meta;
    }

    function def(argsDefine, fn) {
        meta.set(fn, "paramspec", _parseArgsMeta(argsDefine, util.parseParamNames(fn)));
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
        util.mix(define, interface_);
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
                    meta.set(obj[p], "paramspec", _parseArgsMeta(interface_[p]));
                }
            });

            interfaces.push(interface_);
        }
    }

    function $checkParams() {
        var caller = arguments.callee.caller;
        var args = caller["arguments"];
        var paramsMeta;
        if(arguments.length === 0) {
            paramsMeta = meta.get(caller, "paramspec");
        } else {
            paramsMeta = _parseArgsMeta(util.parseArray(arguments), util.parseParamNames(caller));
        }
        var type;
        for(var i = 0, l = args.length; i < l; i++) {
            type = paramsMeta[i].type;
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
            "context": obj,
            "methodizeTo": null,
            "alias": null
        };
        option = util.merge(defauls, module.includeOption, option);

        var methodizeIt = option.methodize;
        Object.keys(module).forEach(function(p) {
            var alias = option.alias && option.alias[p] ? option.alias[p] : p;
            if(!(/^__.*__$/.test(p)) && ["onIncluded", "includeOption"].indexOf(p) == -1) {
                var mp = module[p];
                if(methodizeIt && typeof mp == "function") {
                    obj[alias] = util.methodize(mp, option.context, option.methodizeTo);
                } else {
                    obj[alias] = module[p];
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

        //返回此方法的调用者的拥有者(prototype)
        //此方法不可像this.proto().proto()这样用，请像this.proto().__proto__
        /**
         * get member from base prototype
         * @param  {String} member member name
         * @return {Object}
         */
         /*
        protoMember: function(member) {
            var caller = arguments.callee.caller;
            var callerName = caller.name || meta.get(caller, "name");
            var callerOwner = this._callerOwner(caller, callerName);
            if(callerOwner) {
                var ptoto = meta.get(callerOwner, "proto");
                if(proto) {
                    return proto[member];
                }
            }
        },*/
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
        },
        /**
         * include a module
         * @param  {Object} module
         * @param  {Object} [option]
         * @return {Object} this
         */
        include: function(module, option) {
            Mayjs.$include(module, this, option);
            return this;
        },
        /**
         * implement a interface_
         * @param  {Interface} interface_
         * @return {Object} this
         */
        implement: function(interface_) {
            Mayjs.$implement(interface_, this);
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
        meta: function(name) {
            return meta.get(this, name);
        },
        /**
         * dsl
         * @function
         * @see Mayjs.$dsl
         */
        dsl: Mayjs.$dsl
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


    Mayjs.$extend = $extend;
    Mayjs.Base = Base;
    Mayjs.IBase = IBase;
    Mayjs.$class = $class;
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
        var wrappers = arguments.callee.findWrappersByObj(obj);

        obj = util.toObject(obj);

        if(wrappers.length === 0) return obj;

        var proxy = new Mayjs.Base();

        wrappers.forEach(function(wrapper) {
            proxy.include(wrapper.module, util.merge({
                "context": obj
            }, wrapper.includeOption));
        });

        return proxy;
    }

    meta.set($, "map", {});

    util.mix({

        /**
         * 从字典中查找prototype|interface_|value type的注册扩展模块
         * @memberof Mayjs.$
         * @param {Object|Interface|String} type
         * @return {Array}
         */
        findWrappersByType: function(type) {
            return meta.get($, "map")[type] || [];
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

                proto = oldProto.prototype || (oldProto.constructor ? oldProto.constructor.prototype : null);

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
            if(objType == "object") { //reference type
                wrappers = wrappers.concat($.findWrappersByPrototype(obj.prototype || obj.constructor.prototype));
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
            var wrappers = meta.get($, "map")[type];
            if(!wrappers || wrappers.length < 1) {
                return false;
            } else {
                return wrappers.filter(function(w) {
                    return w.module == module;
                }).length > 0;
            }
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
            if(typeof type == "function") {
                type = type.prototype;
            }

            if(!type || ["string", "object"].indexOf(typeof type) == -1) return;
            if(typeof module != "object") return;

            var map = meta.get($, "map");
            var modules = map[type];
            if(!modules) {
                modules = map[type] = [];
            }

            if(!$.exists(type, module)) {
                modules.push({
                    "module": module,
                    "includeOption": util.merge(module.includeOption, includeOption)
                });
            }

            return this;
        }
    }, $);


    /**
     * 给对象包含对象原型的扩展模块，并返回对象自己
     * 如果对象是值类型，会新建一个它对应的引用类型对象，包含扩展模块后返回
     * @memberof Mayjs
     * @param {Object} obj 对象
     * @param {Object}
     */

    function $$(obj) {
        var wrappers = $.findWrappersByObj(obj);

        obj = util.toObject(obj);

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

    function _checkParams(fn, args) {
        var caller = fn || arguments.callee.caller;
        var paramsMeta = meta.get(caller, "paramspec");
        args = args || caller["arguments"];
        var type;
        for(var i = 0, l = args.length; i < l; i++) {
            type = paramsMeta[i].type;
            //将方法的参数声明为null类型，表明其可为任何值，所以总是验证通过
            if(type === null) return true;
            if(!Mayjs.$is(type, args[i])) {
                return false;
            }
        }
        return true;
    }

    function dispatch(overloads, args) {
        var l = args.length;

        var argsMeta = function(fn) {
                return meta.get(fn, "paramspec");
            };

        var matches = overloads.filter(function(fn) {
            return argsMeta(fn).length >= l;
        });
        if(matches.length <= 1) return matches[0];

        var orderedMatches = matches.sort(function(fn1, fn2) {
            return argsMeta(fn1).length - argsMeta(fn2).length;
        });

        var fn;
        while((fn = orderedMatches.shift())) {
            if(_checkParams(fn, args)) {
                return fn;
            }
        }
    }


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


    function $overload(paramsType, fn) {
        //存储重载的方法
        var _overloads = [util.def(paramsType, fn)];

        var main = function() {
                var args = arguments;
                var fn = dispatch(_overloads, args);
                if(fn) {
                    return fn.apply(this, args);
                }
            };

        main.overload = function(argsMeta, fn) {
            _overloads.push(util.def(argsMeta, fn));
            return this;
        };

        return main;
    }

    Mayjs.$overload = $overload;
}, Mayjs);Mayjs.dsl = Mayjs.$run(function(Mayjs) {
    var util = Mayjs.util;

    var dsl = {
        $obj: function(a) {
            var o = new this.Base();
            Mayjs.util.mix(a, o);
            return o;
        },

        $meta: function(obj, name) {
            return Mayjs.meta.get(obj, name);
        }
    };

    var utilExcludes = ["parseParamNames", "def"];
    Object.keys(util).forEach(function(name) {
        if(utilExcludes.indexOf(name) == -1)
            dsl["$" + name] = util[name];
    });

    Object.keys(Mayjs).forEach(function(name) {
        if(/^\$/.test(name)){
            dsl[name] = Mayjs[name];
        }
    });

    return dsl;
}, Mayjs);

Mayjs.DSL = Mayjs.$dsl(Mayjs.dsl);