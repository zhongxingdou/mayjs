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

            this.constructor.fireInitialized && this.constructor.fireInitialized(this);
        }
    });

    var KlazzStatics = {
        __observers__: [],
        fireInitialized: function(instance){
            this.__observers__.forEach(function(observer){
                observer(instance);
            });        
        },
        /**
         * 添加类的初始化事件的监听者
         * @param  {function} observer
         */
        onInitialize: function(observer){
            this.__observers__.push(observer);
        },
        /**
         * 包含指定的module到当前类中
         * @param  {IModule} module
         * @param  {IModuleOption} option
         */
        include: function(module, option){
            if(module.onIncluded){
                option = option || {};
                option.stopCallback = true;

                M.$include(this.prototype, module, option);

                this.onInitialize(function(instance){
                    var context = option.context || instance;
                    module.onIncluded.call(instance, context);
                });
            }else{
                M.$include(this.prototype, module, option);
            }
        },      

        /**
        * 继承当前类，产生新类
        * @memberof M~Klass
        * @param {Object} classDefine
        */
        extend: function(classDefine){
            var proto = this.prototype.extend(classDefine);

            //如果prototype未定义initialize，则为其添加一个
            if(!proto.hasOwnProperty("initialize")){
                proto.initialize = function(){
                    //调用父类的initiazlie
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
            /*
            var excludes = ["prototype"];
            for(var p in Klass){
                if(excludes.indexOf(p) == -1){
                    clazz[p] = this[p];
                }
            }*/

            M.MObjectUtil.mix(clazz, Object.create(KlazzStatics));

            if(classDefine.modules && clazz.include){
                classDefine.modules.forEach(function(module){
                    clazz.include(module);
                })
            }

            return clazz;
        }
    }    

    M.MObjectUtil.mix(Klass, Object.create(KlazzStatics));

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