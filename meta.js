if(!this.Mayjs)Mayjs = {};
Mayjs.meta = {
    _parseMetaName: function(name) {
        if(!/^__.*__$/.test(name)) {
            name = "__" + name + "__";
        }
        return name;
    },


    /**
     * set meta of obj
     * @memberof Mayjs.$meta
     * @function set
     * @param {Object} obj
     * @param {String} name meta name
     * @param {Object} value meta value
     * @param {Boolean} [readonly=false]
     */
    set: function(obj, name, value, readonly) {
        Object.defineProperty(obj, Mayjs.meta._parseMetaName(name), {
            value: value,
            writable: readonly !== true
        });
    },

    /**
     * get meta form obj
     * @function get
     * @memberof Mayjs.$meta
     * @param  {Object}  obj
     * @param  {String}  name
     */
    get: function(obj, name) {
        return obj[Mayjs.meta._parseMetaName(name)];
    },

    /**
     * meta是否存在
     * @memberof Mayjs.$meta
     * @param  {Object}  obj
     * @param  {String}  name
     * @return {Boolean}
     */
    has: function(obj, name) {
        return obj.hasOwnProperty(Mayjs.meta._parseMetaName(name));
    }
};
