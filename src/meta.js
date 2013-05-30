var meta = (function() {
    var _parseMetaName = function(name) {
            if(!/^__.*__$/.test(name)) {
                name = "__" + name + "__";
            }
            return name;
        };

    return {
        /**
         * set meta of obj
         * @param {Object} obj
         * @param {String} name meta name
         * @param {Object} value meta value
         * @param {Boolean} [readonly=false]
         */
        set: function(obj, name, value, readonly) {
            Object.defineProperty(obj, _parseMetaName(name), {
                value: value,
                writable: readonly !== true
            });
        },

        /**
         * get meta form obj
         * @param  {Object}  obj
         * @param  {String}  name
         */
        get: function(obj, name) {
            return obj[_parseMetaName(name)];
        },

        /**
         * meta是否存在
         * @param  {Object}  obj
         * @param  {String}  name
         * @return {Boolean}
         */
        has: function(obj, name) {
            return obj.hasOwnProperty(_parseMetaName(name));
        }
    };
})();

if(typeof Mayjs != "undefined" && Mayjs) {
    Mayjs.meta = meta;
    meta = undefined;
}