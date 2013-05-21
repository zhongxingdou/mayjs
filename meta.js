Mayjs.$run(function(Mayjs) {
    var _parseMetaName = function(name) {
            if(!/^__.*__$/.test(name)) {
                name = "__" + name + "__";
            }
            return name;
    };

    Mayjs.meta = {
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
            Object.defineProperty(obj, _parseMetaName(name), {
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
            return obj[_parseMetaName(name)];
        },

        /**
         * meta是否存在
         * @memberof Mayjs.$meta
         * @param  {Object}  obj
         * @param  {String}  name
         * @return {Boolean}
         */
        has: function(obj, name) {
            return obj.hasOwnProperty(_parseMetaName(name));
        }
    };
}, Mayjs);