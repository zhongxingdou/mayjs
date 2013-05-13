/**
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
        var clazz = function() {
                var initialize = clazz.prototype.initialize;
                if(initialize) {
                    initialize.apply(this, arguments);
                }
            };

        meta.set(clazz, "config", config, true);

        var proto = Object.create(baseProto);

        //link to base prototype in IE
        if(!proto["__proto__"]) {
            meta.set(proto, "proto", baseProto, true);
        }

        //copy statics member to clazz
        var statics = config["@statics"];
        if(statics) {
            util.mix(statics, clazz);
        }

        if(!clazz.extend) {
            var fn = arguments.callee;
            clazz.extend = function(config) {
                return fn(this.prototype, config);
            };
        }

        clazz.prototype = proto;

        //copy prototype member of config to clazz.prototype
        var defineProto = Object.keys(config).filter(function(name) {
            return name.charAt(0) != "@" && name != "constructor";
        });
        defineProto.forEach(function(p) {
            proto[p] = config[p];
        });

        //initialize clazz.prototype's interfaces meta
        meta.set(proto, "interfaces", []);

        var implns = config["@implements"];
        if(implns){
            if(!Mayjs.$is(Array, implns)){
                implns = [implns];
            }
            implns.forEach(function(interface_){
                Mayjs.$implement(interface_, proto);
            });
        }

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
        "@implements": IBase,
        "@statics": {
            "extend": function(config) {
                if(!config.initialize) {
                    config.initialize = function() {
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
            meta.set(this, "interfaces", []);
        },
        _callerOwner: function(caller) {
            var callerOwner = null;
            util.trace(this, "__proto__", function(proto) {
                Object.keys(proto).forEach(function(p) {
                    if(proto[p] == caller) {
                        callerOwner = proto;
                        caller["@name"] = p;
                        return false;
                    }
                });
                if(callerOwner) return false;
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
        protoMember: function(member) {
            var callerOwner = this._callerOwner(arguments.callee.caller);
            if(callerOwner) {
                var ptoto;
                if((proto = meta.get(callerOwner, "proto"))) {
                    return proto[member];
                }
            }
        },
        /**
         * 类似C#的base()和Java的super()，获取调用此方法的方法名，在对象的base prototype中调用这个方法
         * @return {Object}
         */
        base: function() {
            var caller = arguments.callee.caller;
            var callerOwner = this._callerOwner(caller);

            var callerName = caller["@name"];
            delete caller["@name"];

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

    Mayjs.$extend = $extend;
    Mayjs.Base = Base;
    Mayjs.IBase = IBase;
},Mayjs);