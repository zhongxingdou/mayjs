Mayjs.util = Mayjs.$run(function(Mayjs) {
    return {
        forEach: function(obj, fn){
            for(var p in obj){
                if(obj.hasOwnProperty(p) && !(/^_/.test(p))){
                    if(fn(p, obj[p]) === false)break;
                }
            }
        },
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
         * @param  {Object} dest [description]
         * @param  {Object} src [description]
         * @param  {String[]} [whitelist=null] 不想被覆盖的成员
         * @return {Object}
         */

        mix: function(dest, src, whitelist) {
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
                var obj = context || this;
                var args = [methodizeTo ? methodizeTo(obj) : obj].concat(slice.call(arguments, 0));
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
}, Mayjs);