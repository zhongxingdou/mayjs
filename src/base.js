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


    function Klass(){}
    Klass.prototype = BaseObj.extend({
        initialize: function(){
            this.__interfaces__ = [];
            this.base(); //call BaseObj.initialize
        }       
    });
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

    var BaseClass = Klass.extend({})

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