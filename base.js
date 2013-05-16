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
},Mayjs);