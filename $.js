/**
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
            proxy.include(wrapper.module, util.merge(wrapper.includeOption, {
                "context": obj
            }, ["context"]));
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
                    "includeOption": includeOption
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
            if(obj.include) {
                obj.include(wrapper.module, wrapper.includeOption);
            } else {
                Mayjs.$include(wrapper.module, obj, wrapper.includeOption);
            }
        });

        return obj;
    }

    Mayjs.$ = $;
    Mayjs.$$ = $$;
}, Mayjs);