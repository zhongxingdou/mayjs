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
    var clone = M.MObjectUtil.clone;
    var traverseChain = M.MObjectUtil.traverseChain;

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
     * @param  {Object} opt.module
     * @param  {Object} opt.to
     * @param  {Object} opt.option
     * @return {Object}
     */

    function $include(opt) {
        var option = opt.option;
        var module = opt.module;
        var obj = opt.to;

        var defauls = {
            "methodize": false,
            "context": null,
            "methodizeTo": null,
            "alias": null,
            "forceInclude": false
        };

        option = merge(defauls, option);

        if(!meta.has(obj, "modules")){
            meta.set(obj, "modules", []);
        }

        var includedModules = _collectIncludedModules(obj);
        if(includedModules.indexOf(module) != -1 && !option.forceInclude){
            return;
        }

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

        if(meta.has(module, "interfaces")) {
            meta.get(module, "interfaces").forEach(function(interface_) {
                M.$implement(interface_, obj);
            });
        }

        _registIncludedModule(obj, module, includedModules);

        if(module.onIncluded) {
            module.onIncluded.call(obj, option.context || obj);
        }
    }

    var _collectIncludedModules = function(obj){
        var modules = meta.get(obj, "modules");
        traverseChain(obj, "__proto__", function(proto){
            modules.concat(meta.get(proto, "modules"));
        });
        return modules;
    };

    var _registIncludedModule = function(obj, module, includedModules){
        var objModules = meta.get(obj, "modules");

        var moduleItsModules = meta.get(module, "modules") || [];

        moduleItsModules.concat([module]).forEach(function(m){
            if(includedModules.indexOf(m) == -1){
                objModules.push(m);
            }
        });
    };

    M.$module = $module;
    M.$include = $include;
}, Mayjs);