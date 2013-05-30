/**
 * @require M.meta
 * @require M.util
 * @require M.MObjectUtil
 * @require M.$interface
 */
Mayjs.$run(function(M) {
    var meta = M.meta;
    var methodize = M.util.methodize;
    var merge = M.MObjectUtil.merge;
    var eachOwn = M.MObjectUtil.eachOwn;

    /**
     * 定义一个module
     * @memberof M
     * @param  {Object} o
     * @return {Object}
     */

    function $module(o) {
        return o;
    }

    /**
     * include module to obj with option
     * @memberof M
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
        option = merge(defauls, option);

        var needMethodize = option.methodize;

        eachOwn(module, function(k, v){
            if("onIncluded" != k) {
                var name = (option.alias && option.alias[k]) ? option.alias[k] : k;
                if(needMethodize && typeof v == "function") {
                    obj[name] = methodize(v, option.context, option.methodizeTo);
                } else {
                    obj[name] = v;
                }
            }
        });

        if(meta.has("interfaces")) {
            meta.get("interfaces").forEach(function(interface_) {
                M.$implement(interface_, obj);
            });
        }

        if(module.onIncluded) {
            module.onIncluded.call(obj, option.context || obj);
        }
    }

    M.$module = $module;
    M.$include = $include;
}, Mayjs);