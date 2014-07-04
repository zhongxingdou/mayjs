/**
 * 新建并返回对象的代理，该代理包含了对象原型的扩展模块<br/>
 * !!!为了JSDoc能够生成文档而标记为一个类，不要使用new $()调用。
 * @require M.util
 * @require M.module
 * @require M.MObjectUtil
 * @memberof M
 * @class
 */
Mayjs.util.run(function(M) {
    var toObject = M.util.toObject;
    var merge = M.MObjectUtil.merge;
    var mix = M.MObjectUtil.mix;

    var Wrapper = M.$class({
        initialize: function() {
            this.__map__ = [];
            this.__DSL__ = {
                $: this.$.bind(this),
                $$: this.$$.bind(this),
                using: this.using.bind(this)
            }
        },
        DSL: function(){
            return M.util.dsl(this.__DSL__);
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
        $: function(obj) {
            return this.__wrap(obj, {}, {context: obj});
        },

        /**
         * 给对象包含对象原型的扩展模块，并返回对象自己
         * 如果对象是值类型，会新建一个它对应的引用类型对象，包含扩展模块后返回
         * @memberof M
         * @param {Object} obj 对象
         * @param {Object}
         */

        $$: function(obj) {
            return this.__wrap(obj);
        },

        /**
         * 注册一个prototype或interface_或value object的扩展模块
         * @memberof M.$
         * @param {Object} module
         * @param {Object|Interface|String} type
         * @param {Object} [includeOption]
         */
        using: function(module, supports) {
            var includeOption = module.__option__ || {};
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

        /**
         * 从字典中查找prototype|interface_|value type的注册扩展模块
         * @memberof M.$
         * @param {Object|Interface|String} type
         * @return {Array}
         */
        __findWrappersByType: function(type) {
            var ms = this.__map__.filter(function(item) {
                return item.type == type;
            });
            return ms.length === 0 ? [] : ms[0].modules;
        },

        /**
         * 查找对象原型链的扩展模块
         * @memberof M.$
         * @param {Object} proto 对象的原型
         * @return {Array}
         */
        __findWrappersByPrototype: function(proto) {
            var self = this;
            var wrappers = [];
            var oldProto;

            while(proto) {
                wrappers = wrappers.concat(self.__findWrappersByType(proto));
                if(proto.hasOwnProperty("__interfaces__")){
                    proto.__interfaces__.forEach(function(interface_) {
                        wrappers = wrappers.concat(self.__findWrappersByType(interface_));
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

        /**
         * 查找对象的扩展模块
         * @memberof M.$
         * @param {Object|Interface|String} obj
         * @return {Array}
         */
        __findWrappersByObj: function(obj) {
            if(obj === null) return [];

            var wrappers = [];
            var self = this;
            var addTypeWrappers = function(type) {
                    wrappers = wrappers.concat(self.__findWrappersByType(type));
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


    M.$wrapper = function () {
        return new Wrapper().__DSL__;
    }

    M.Wrapper = Wrapper;
}, Mayjs);