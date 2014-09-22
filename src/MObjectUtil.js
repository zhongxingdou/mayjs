/** @namespace M.MObjectUtil **/
M.MObjectUtil = {
    /**
    * 判断name是否符合私有成员的名称规范
    * @param {string} name
    * @returns {boolean}
    */
    isPrivate: function(name) {
        return(/^__/).test(name);
    },

    /**
    * 判断name是否符合受保护成员的名称规范
    * @param {string} name
    * @returns {boolean}
    */
    isProtected: function(name) {
        return(/^_(?!_)/).test(name);
    },

    /**
    * 判断name是否符合公开成员的名称规范
    * @param {string} name
    * @returns {boolean}
    */
    isPublic: function(name) {
        return !this.isProtected(name) && !this.isPrivate(name);
    },

    /**
    * 判断对象是否拥有指定属性，该属性不能为function
    * @param {string} obj
    * @param {string} property
    * @returns {boolean}
    */
    has: function(obj, property) {
        return(obj && obj.hasOwnProperty(property) && typeof obj[property] != "function") || false;
    },

    /**
    * 判断对象是否可响应指定方法
    * @param {string} obj
    * @param {string} funcName
    * @returns {boolean}
    */
    can: function(obj, funcName) {
        return(obj && obj[funcName] && typeof obj[funcName] == "function") || false;
    },

    /**
    * 遍历对象，调用指定函数
    * @param {string} obj
    * @param {function} fn
    */
    eachAll: function(obj, fn) {
        for(var p in obj) {
            if(fn(p, obj[p]) === false) break;
        }
    },

    /**
    * 遍历对象拥有的成员，调用指定函数
    * @param {string} obj
    * @param {function} fn
    */
    eachOwn: function(obj, fn) {
        for(var p in obj) {
            if(obj.hasOwnProperty(p) && this.isPublic(p)) {
                if(fn(p, obj[p]) === false) break;
            }
        }
    },

    /**
    * 遍历对象的属性（除方法外的所有成员），调用指定函数
    * @param {string} obj
    * @param {function} fn
    */
    eachProp: function(obj, fn) {
        this.eachOwn(obj, function(p, op) {
            if(typeof op != "function") {
                return fn(p, op);
            }
        });
    },

    /**
     * 根据指定属性来追溯
     * @param {Object} obj 对象
     * @param {String} prop 属性名
     * @param {function(a)} fn 处理函数(追溯到的对象)
     * @returns {boolean} 全部处理完返回true，否则false
     */
    traverseChain: function(obj, prop, fn) {
        var v = obj[prop];
        while(v) {
            if(fn(v) === false) return false;
            v = v[prop];
        }
        return true;
    },

    /**
     * clone克隆指定对象，如果对象自己有clone方法，则调用对象自己的clone方法
     * @param  {Object} obj 被克隆的对象
     * @param  {boolean} [deep=false] 是否深度克隆
     * @returns {Object}
     */
    clone: function(o, deep) {
        if(!o) return o;

        if(['object', 'function'].indexOf(typeof(o)) == -1) { //value type
            return o;
        }

        if(typeof o.clone == "function") {
            return o.clone(deep);
        }

        var cloneObj = {};
        var className = Object.prototype.toString.call(o).slice(8, -1);
        if(className === 'Array') {
            cloneObj = [];
            if(deep) {
                for(var i = 0, l = o.length; i < l; i++) {
                    cloneObj.push(arguments.callee(o[i], deep));
                }
            } else {
                cloneObj = o.slice(0);
            }
        } else if(className !== 'Object') {
            cloneObj = new o.constructor(o.valueOf());
        }

        if(deep) {
            for(var p in o) {
                if( p == 'constructor') continue;
                var op = o[p];
                if( p == '__proto__'){
                    cloneObj[p] = op;
                    continue;
                }
                if(Object.prototype.isPrototypeOf(op)) {
                    cloneObj[p] = arguments.callee(op, deep);
                } else {
                    cloneObj[p] = op;
                }
            }
        } else {
            for(var p in o) {
                cloneObj[p] = o[p];
            }
        }
        return cloneObj;
    },

    /**
     * copy members from src to obj
     * @param  {Object} obj [description]
     * @param  {Object} src [description]
     * @param  {String[]} [whitelist=null] 不想被覆盖的成员
     * @return {Object}
     */
    mix: function(obj, src, whitelist) {
        if(!src) return obj;
        var p;
        if(whitelist) {
            for(p in src) {
                if(whitelist.indexOf(p) == -1) {
                    obj[p] = src[p];
                }
            }
        } else {
            for(p in src) {
                obj[p] = src[p];
            }
        }
        return obj;
    },

    /**
     * 依次合并给定的所有对象到一个新的对象
     * @param {...Object} obj
     * @returns {Object} new object, merge 
     */
    merge: function(/*a,b,c,d,...*/) {
        var obj = {},
            curr = null,
            p;

        for(var i = 0, l = arguments.length; i < l; i++) {
            curr = arguments[i];
            if(!curr) continue;
            for(p in curr) {
                obj[p] = curr[p];
            }
        }

        return obj;
    }
}

/**
 * 依次合并给定的所有对象到一个新的对象，是{@link M.MObjectUtil.merge}的别名
 * @memberof M
 * @function
 * @param {...Object} obj
 * @returns {Object} new object, merge 
 */
M.$merge = M.MObjectUtil.merge;

/**
 * copy members from src to obj，是{@link M.MObjectUtil.mix}的别名
 * @memberof M
 * @function
 * @param  {Object} obj [description]
 * @param  {Object} src [description]
 * @param  {String[]} [whitelist=null] 不想被覆盖的成员
 * @return {Object}
 */
M.$mix = M.MObjectUtil.mix;

/**
 * clone克隆指定对象，如果对象自己有clone方法，则调用对象自己的clone方法，是{@link M.MObjectUtil.clone}的别名
 * @memberof M
 * @function
 * @param  {Object} obj 被克隆的对象
 * @param  {boolean} [deep=false] 是否深度克隆
 * @returns {Object}
 */
M.$clone = M.MObjectUtil.clone;
