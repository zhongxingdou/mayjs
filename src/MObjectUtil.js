Mayjs.MObjectUtil = {
    isPrivate: function(name) {
        return(/^__/).test(name);
    },

    isProtected: function(name) {
        return(/^_(?!_)/).test(name);
    },

    isPublic: function(name) {
        return !Mayjs.MObjectUtil.isProtected(name) && !Mayjs.MObjectUtil.isPrivate(name);
    },

    have: function(o, property) {
        return(o && o.hasOwnProperty(property) && typeof o[property] != "function") || false;
    },

    can: function(o, fn) {
        return(o && o[fn] && typeof o[fn] == "function") || false;
    },

    eachAll: function(o, fn) {
        for(var p in o) {
            if(fn(p, o[p]) === false) break;
        }
    },

    eachOwn: function(o, fn) {
        for(var p in o) {
            if(o.hasOwnProperty(p) && Mayjs.MObjectUtil.isPublic(p)) {
                if(fn(p, o[p]) === false) break;
            }
        }
    },

    eachProp: function(o, fn) {
        Mayjs.MObjectUtil.eachOwn(o, function(p, op) {
            if(typeof op != "function") {
                return fn(p, op);
            }
        });
    },
 
    /**
     * 根据指定属性来追溯
     * @memberof Mayjs
     * @param {Object} o 对象
     * @param {String} prop 属性名
     * @param {Function} fn(a) 处理函数(追溯到的对象)
     * @return Boolean 全部处理完则返回true，中途结果返回false
     */

    traverseChain: function(o, prop, fn) {
        var v = o[prop];
        while(v) {
            if(fn(v) === false) return false;
            v = v[prop];
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
        if(!o)return o;

        if(['object','function'].indexOf(typeof(o)) == -1){ //value type
            return o;
        }

        if(typeof o.clone == "function"){
            return o.clone(deep);
        }

        var cloneObj = {};
        var className = Object.prototype.toString.call(o).slice(8, -1);
        if(className === 'Array'){
            cloneObj = [];
            if(deep){
                for(var i=0,l=o.length; i<l; i++){
                    cloneObj.push(arguments.callee(o[i], deep));
                }
            }else{
                cloneObj = o.slice(0);
            }
        }else if(className !== 'Object'){
            cloneObj = new o.constructor(o.valueOf());
        }

        if(deep){
            for(var p in o) {
                var op = o[p];
                if(Object.prototype.isPrototypeOf(op)){
                    cloneObj[p] = arguments.callee(op, deep);
                }else{
                    cloneObj[p] = op;
                }
            }
        }else{
            for(var p in o) {
                cloneObj[p] = o[p];
            }
        }
        return cloneObj;
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
        if(whitelist) {
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
    merge: function(o, a /*,b,c,...n*/ ) {
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

Mayjs.$mix = Mayjs.MObjectUtil.mix;
Mayjs.$merge =Mayjs.MObjectUtil.merge;
Mayjs.$clone = Mayjs.MObjectUtil.clone;