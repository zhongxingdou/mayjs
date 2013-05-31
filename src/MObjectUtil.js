var MObjectUtil = {
    _isPrivate: function(name) {
        return(/^_/).test(name);
    },
    has: function(o, property) {
        return(o && o.hasOwnProperty(property) && typeof o[property] != "function") || false;
    },
    can: function(o, fn) {
        return(o && o[fn] && typeof o[fn] == "function") || false;
    },
    eachKey: function(o, fn) {
        for(var p in o) {
            if(fn(o[p]) === false) break;
        }
    },
    eachProp: function(o, fn, eachPrivates) {
        for(var p in o) {
            if(o.hasOwnProperty(p) && (eachPrivates || !MObjectUtil._isPrivate(p)) && typeof o[p] != "function") {
                if(fn(p, o[p]) === false) break;
            }
        }
    },
    eachOwn: function(o, fn, eachPrivates) {
        for(var p in o) {
            if(o.hasOwnProperty(p) && (eachPrivates || !MObjectUtil._isPrivate(p))) {
                if(fn(p, o[p]) === false) break;
            }
        }
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
     * clone oect
     * @memberof Mayjs
     * @param  {Object} o 被克隆的对象
     * @param  {Boolean} [deep=false] 是否深度克隆
     * @return {Object} o的克隆
     */

    clone: function(o, deep) {
        var cloneObj = {};
        for(var p in o) {
            cloneObj[p] = deep ? $clone(o[p]) : o[p];
        }
        return cloneObj;
    },
    delegate: function(o, fn) {
        return o[fn].bind(o);
    },
    set: function(o, name, value) {
        o[name] = value;
        return o;
    },
    get: function(o, name) {
        return o[name];
    },
    call: function(o, fn) {
        fn = o[fn];
        var args = util.parseArray(arguments).split(2);
        return fn.apply(o, args);
    },

    /**
     * copy members from src to o
     * @memberof Mayjs
     * @param  {Object} o [description]
     * @param  {Object} src [description]
     * @param  {String[]} [whitelist=null] 不想被覆盖的成员
     * @return {Object}
     */

    mix: function(o, src, whitelist) {
        if(!src) return o;
        var p;
        if(whitelist && whitelist.length > 0) {
            for(p in src) {
                if(whitelist.indexOf(p) == -1) {
                    o[p] = src[p];
                }
            }
        } else {
            for(p in src) {
                o[p] = src[p];
            }
        }
        return o;
    },
    /**
     * merge o to a to b ... n
     * @memberof Mayjs
     * @param {Object} o
     * @param {Object} a
     * @return {Object} merge result
     */

    merge: function(o, a/*,b,c,...n*/) {
        var obj = {},
            curr = null,
            p;

        for(var i = 0, l = arguments.length; i < l; i++) {
            curr = arguments[i];
            if(!curr)continue;
            for(p in curr) {
                obj[p] = curr[p];
            }
        }

        return obj;
    }
};

if(typeof Mayjs != "undefined" && Mayjs) {
    Mayjs.MObjectUtil = MObjectUtil;
    MObjectUtil = undefined;
}