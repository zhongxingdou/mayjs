/**
 * [base description]
 * @require M.MObjectUtil
 * @require M.interface
 * @type {Object}
 */

Mayjs.util.run(function(M) {
    var traverseChain = M.MObjectUtil.traverseChain;
    var mix = M.MObjectUtil.mix;

    var BaseProto = {
        initialize: function(){
            this.__interfaces__ = [];
        },
        extend: function(subProtoDefine){
            var subProto = Object.create(this);
            this.initialize.call(subProto);

            if(!Object["__proto__"]) {//for IE browser
                subProto["__proto__"] = this;
            }

            //merge config to proto
            for(var name in subProtoDefine){
                var member = subProtoDefine[name]; 
                subProto[name] = member;

                //add __name__ to method
                if(typeof(member) == "function"){
                    member.__name__ = name;
                }
            }

            return subProto;
        },
        base: function(){
            var caller = arguments.callee.caller;
            var callerName = caller.name || caller.__name__;
            var callerOwner = this.getCallerOwner(caller, callerName);
            if(!callerName)callerName = caller.__name__; //在this._callerOwner方法中会为caller设置name meta;

            var base = callerOwner ? callerOwner.__proto__ : null;
            var fn = base ? base[callerName] : null;

            if(typeof fn == "function") {
                return fn.apply(this, arguments);
            }
        },
        getCallerOwner: function(caller, callerName){
            var callerOwner = null;
            if(callerName){
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

    var BaseClassProto = BaseProto.extend({
        extend: function(subClassProtoDefine){
            var subProto = this.base(subClassProtoDefine);

            var jsConstructor;
            if(!Object["__proto__"]) {//for IE browser
                jsConstructor = function(){
                    this["__proto__"] = proto;
                    var initialize = arguments.callee.prototype.initialize;
                    if(initialize) {
                        initialize.apply(this, arguments);
                    }
                }
            }else{
                jsConstructor = function(){
                    var initialize = arguments.callee.prototype.initialize;
                    if(initialize) {
                        initialize.apply(this, arguments);
                    }
                }
            }

            jsConstructor.prototype = subProto;
            jsConstructor.extend = arguments.callee.bind(subProto);

            return jsConstructor;
        }
    })

    function $extend(baseProto, config) {
        var proto = Object.create(baseProto);
        var clazz;
        if(!Object["__proto__"]) {//for IE browser
            //meta.set(proto, "proto", baseProto, true);
            proto.__proto__ = baseProto;
            clazz = function() {
                this["__proto__"] = proto;
                var initialize = clazz.prototype.initialize;
                if(initialize) {
                    initialize.apply(this, arguments);
                }
            };
        }else{//for standard browser
            clazz = function() {
                var initialize = clazz.prototype.initialize;
                if(initialize) {
                    initialize.apply(this, arguments);
                }
            };
        }

        if(!clazz.extend) {
            var fn = arguments.callee;
            clazz.extend = function(config) {
                return fn(this.prototype, config);
            };
        }

        //merge config to proto
        for(var p in config){
            var ap = config[p];

            //add __name__ to method
            if(typeof(ap) == "function"){
                ap.__name__ = p;
            }
            proto[p] = ap;
        }

        proto.__interfaces__ = [];

        clazz.prototype = proto;

        return clazz;
    }
    /**
     * @memberof M
     * @type {Interface}
     */
    var IBase = M.$interface({
        "initialize": [],
        "base": [],
        "__interfaces__": Array
        //"__modules__": Array
    });

    /**
     * @lends M.Base.prototype
     */
    var Base = $extend(Object.prototype, {
        /**
         * initialize instance of this prototype <br>
         * 使用M.Base.create()或M.$obj()来创建实例，
         * @constructs
         * @see M.$obj
         */
        "initialize": function() {
            this.__interfaces__ = [];
            //meta.set(this, "modules", []);
        },
        _callerOwner: function(caller, callerName) {
            var callerOwner = null;
            if(callerName){
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
        },

        /**
         * 类似C#的base()和Java的super()，获取调用此方法的方法名，在对象的base prototype中调用这个方法
         * @return {Object}
         */
        base: function() {
            var caller = arguments.callee.caller;
            var callerName = caller.name || caller.__name__;
            var callerOwner = this._callerOwner(caller, callerName);
            if(!callerName)callerName = caller.__name__; //在this._callerOwner方法中会为caller设置name meta;

            var base = callerOwner ? callerOwner.__proto__ : null;
            var fn = base ? base[callerName] : null;

            if(typeof fn == "function") {
                return fn.apply(this, arguments);
            }
        }
    });

    M.$implement(IBase, Base.prototype);

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
        //return Base.extend(proto);
        return BaseClassProto.extend(proto);
    }

    function $obj(obj){
        var o = new Base();
        mix(o, obj);
        return o;
    }


    M.$extend = $extend;
    M.Base = Base;
    M.IBase = IBase;
    M.$class = $class;
    M.$obj = $obj;
    M.BaseProto = BaseProto;
    M.BaseClassProto = BaseClassProto;
}, Mayjs);