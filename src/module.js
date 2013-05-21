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
            "context": null,
            "methodizeTo": null,
            "alias": null
        };
        option = util.merge(defauls, option);

        var needMethodize = option.methodize;

        util.forEach(module, function(k, v){
            if("onIncluded" != k) {
                var name = (option.alias && option.alias[k]) ? option.alias[k] : k;
                if(needMethodize && typeof v == "function") {
                    obj[name] = util.methodize(v, option.context, option.methodizeTo);
                } else {
                    obj[name] = v;
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