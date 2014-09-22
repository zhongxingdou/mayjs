M.util.run(function(M) {
    var toObject = M.util.toObject;
    var merge = M.MObjectUtil.merge;
    var mix = M.MObjectUtil.mix;

    /**
    * @memberof M
    * @class
    * @constructor
    */
    var Wrapper = M.$class(
        /** @lends M.Wrapper.prototype **/
        {
         /**
          * @alias M.Wrapper
          * @constructor
          * @return {[type]}
          */
        initialize: function() {
            /**
            * type -- module map
            * @type Array
            */
            this.__map__ = [];

            /**
            * @type Object
            */
            this.__DSL__ = {
                $: this.$.bind(this),
                $$: this.$$.bind(this),
            }
            this.__DSL__.$.reg = this.$reg.bind(this);
            this.__DSL__.$.clear = this.$clear.bind(this);
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
        /**
        * 清空wrap module表
        */
        $clear: function(){
            this.__map__ = [];
        },

        /**
        * wrap对象，非侵入
        * @param {Object} obj
        */
        $: function(obj) {
            return this.__wrap(obj, {}, {context: obj});
        },

        /**
         * 直接复制wrap modules中的成员到指定对象
         * @param {Object} obj 对象
         */
        $$: function(obj) {
            return this.__wrap(obj);
        },

        /**
         * 将wrap module注册到prototype,Interface或Class
         * @param {Object} module
         * @param {Object|Interface|Function} supports 
         * @param {Object} [option] 
         */
        $reg: function(module, supports, option) {
            var includeOption = option || module.__option__ || {};
            var types = supports 
                            ? (Array.prototype.isPrototypeOf(supports) ? supports : [supports])  
                            : module.__supports__;

            for(var i=0,l=types.length; i<l; i++){
                var type = types[i];

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
            }
            return this;
        },


        __findWrappersByType: function(type) {
            var ms = this.__map__.filter(function(item) {
                return item.type == type;
            });

            return ms.length === 0 ? [] : ms[0].modules;
        },

        /**
         * 根据prototype,Interface或Class查找已注册的wrap modules
         * @param {Object|Interface|Function} type
         * @return {Array}
         */
        findWrappersByType: function(type){
            if(this != _globalWrapper){
                return _globalWrapper.__findWrappersByType(type).concat(this.__findWrappersByType(type));
            }else{
                return this.__findWrappersByType(type);
            }
        },

        __findWrappersByPrototype: function(proto) {
            var self = this;
            var wrappers = [];
            var oldProto;

            while(proto) {
                wrappers = wrappers.concat(self.findWrappersByType(proto));
                if(proto.hasOwnProperty("__interfaces__")){
                    proto.__interfaces__.forEach(function(interface_) {
                        wrappers = wrappers.concat(self.findWrappersByType(interface_));
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

        __findWrappersByObj: function(obj) {
            if(obj === null) return [];

            var wrappers = [];
            var self = this;
            var addTypeWrappers = function(type) {
                    wrappers = wrappers.concat(self.findWrappersByType(type));
                };

            var objType = typeof obj;
            if(objType == "object" || objType == "function") { //reference type
                wrappers = wrappers.concat(this.__findWrappersByPrototype(obj["__proto__"] || obj.constructor.prototype));
                if(obj.hasOwnProperty("__interfaces__")){
                    obj.__interfaces__.forEach(function(interface_) {
                        addTypeWrappers(interface_);
                    });
                }
            } //else { //value type
               // addTypeWrappers(objType);
            //}

            return wrappers;
        }
    });

    /**
    * 创建一个新的{@link M.Wrapper}并返回它的__DSL__
    * @memberof M
    */
    M.$wrapper = function () {
        return new Wrapper().__DSL__;
    }

    /**
    * @memberof M~_globalWrapper
    * @instance M.Wrapper
    */
    var _globalWrapper = new Wrapper();

    M.MObjectUtil.mix(M, _globalWrapper.__DSL__);

    M.Wrapper = Wrapper;
}, M);