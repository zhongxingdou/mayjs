/**
 * [core description]
 * @require Mayjs.util
 * @require Mayjs.meta
 * @type {Object}
 */
Mayjs.core = {
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
        Mayjs.util.parseArray(arguments).forEach(function(key) {
            _enum[key] = {};
        });

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
        return function() {
            context = context || this;
            var args = [methodizeTo ? methodizeTo(context) : context].concat(Mayjs.util.parseArray(arguments));
            return fn.apply(null, args);
        };
    },
    /**
     * merge a to b
     * @memberof Mayjs
     * @param {Object} a
     * @param {Object} b
     * @param  {String[]} [whitelist=null] 不想被覆盖的成员
     * @return {Object} merge result
     */

    merge: function(a, b, whitelist) {
        var obj = Mayjs.core.clone(b);
        Mayjs.util.mix(a || {}, obj, whitelist);
        return obj;
    },


    safeCall: function(obj, method, args, context) {
        if(obj && typeof(obj[method]) == "function") {
            return obj[method].apply(context || obj, args);
        }
    },

    extend: function(baseProto, config) {
        var meta = Mayjs.meta;
        var clazz = function() {
                var initialize = clazz.prototype.initialize;
                if(initialize) {
                    initialize.apply(this, arguments);
                }
            };

        ["implement", "support", "include"].forEach(function(p) {
            clazz[p] = function() {
                Mayjs.core.safeCall(clazz.prototype, p, arguments);
            };
        });

        meta.set(clazz, "config", config, true);

        var proto = Object.create(baseProto);

        //link to base prototype in IE
        if(!proto["__proto__"]) {
            meta.set(proto, "proto", baseProto, true);
        }

        //copy statics member to clazz
        var statics = config["@statics"];
        if(statics) {
            Mayjs.util.mix(statics, clazz);
        }

        if(!clazz.extend) {
            clazz.extend = function(config) {
                return Mayjs.core.extend(this.prototype, config);
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

        return clazz;
    },
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

    dsl: function(obj) {
        obj = obj || this;

        //create global tempObj
        var tempVarName = "_temp" + Date.now();
        eval(tempVarName + "={value: {}}");

        //get tempObj and set it's value with obj
        var temp = eval(tempVarName);
        temp.value = obj;

        //generate members declare string
        var keys = obj.__dsl__ || Object.keys(obj);
        var members = keys.map(function(name) {
            return name + "=" + tempVarName + ".value" + "['" + name + "']";
        });
        return "var " + members.join(",") + "; delete " + tempVarName;
    }

};