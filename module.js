/**
 * @require Mayjs.meta
 * @require Mayjs.util
 * @require Mayjs.$interface
 */
Mayjs.$run(function(Mayjs) {
    var meta = Mayjs.meta;
    var util = Mayjs.util;

    /**
     * 定义一个module
     * @memberof Mayjs
     * @param  {Object} o
     * @return {Object}
     */

    function $module(o) {
        return o;
    }

    /**
     * include module to obj with option
     * @memberof Mayjs
     * @param  {Object} module
     * @param  {Object} obj
     * @param  {Object} [option]
     * @return {Object}
     */

    function $include(module, obj, option) {
        var defauls = {
            "methodize": false,
            "context": obj,
            "methodizeTo": null,
            "alias": null
        };
        option = util.merge(option, util.merge(module.includeOption, defauls));

        var methodizeIt = option.methodize;
        Object.keys(module).forEach(function(p) {
            var alias = option.alias && option.alias[p] ? option.alias[p] : p;
            if(!(/^__.*__$/.test(p)) && ["onIncluded", "includeOption"].indexOf(p) == -1) {
                var mp = module[p];
                if(methodizeIt && typeof mp == "function") {
                    obj[alias] = util.methodize(mp, option.context, option.methodizeTo);
                } else {
                    obj[alias] = module[p];
                }
            }
        });

        if(meta.has("interfaces")) {
            meta.get("interfaces").forEach(function(interface_) {
                Mayjs.$implement(interface_, obj);
            });
        }

        if(module.onIncluded) {
            module.onIncluded.call(obj, option.context);
        }
    }

    Mayjs.$module = $module;
    Mayjs.$include = $include;
}, Mayjs);