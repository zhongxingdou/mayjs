Mayjs.module = {

    /**
     * 定义一个module
     * @memberof Mayjs
     * @param  {Object} o
     * @return {Object}
     */

    create: function(o) {
        return o;
    },
    /**
     * include module to obj with option
     * @memberof Mayjs
     * @param  {Object} module
     * @param  {Object} obj
     * @param  {Object} [option]
     * @return {Object}
     */

    include: function(module, obj, option) {
        var defauls = {
            "methodize": false,
            "context": obj,
            "methodizeTo": null,
            "alias": null
        };
        option = Mayjs.core.merge(option, Mayjs.core.merge(module.includeOption, defauls));

        var methodizeIt = option.methodize;
        Object.keys(module).forEach(function(p) {
            var alias = option.alias && option.alias[p] ? option.alias[p] : p;
            if(!(/^__.*__$/.test(p)) && ["onIncluded", "includeOption"].indexOf(p) == -1) {
                var mp = module[p];
                if(methodizeIt && typeof mp == "function") {
                    obj[alias] = Mayjs.core.methodize(mp, option.context, option.methodizeTo);
                } else {
                    obj[alias] = module[p];
                }
            }
        });

        if(Mayjs.meta.has("interfaces")) {
            Mayjs.meta.get("interfaces").forEach(function(interface_) {
                Mayjs.interface_.implement(interface_, obj);
            });
        }

        if(module.onIncluded) {
            module.onIncluded.call(obj, option.context);
        }
    }
};