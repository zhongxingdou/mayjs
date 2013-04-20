if(!this.Mayjs)Mayjs = {};
Mayjs.util = {
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
     * 仅仅是运行一个方法，避免暴露全局变量
     * @memberof Mayjs
     * @param  {Function} fn
     * @param  {Object}   context 作为当前对象的对象
     * @return {Object}
     */

    run: function(fn, context) {
        return fn.call(context || {});
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
     * @param  {Object} src [description]
     * @param  {Object} dest [description]
     * @param  {String[]} [whitelist=null] 不想被覆盖的成员
     * @return {Object}
     */

    mix: function(src, dest, whitelist) {
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
    }

};