/**
 * @require M.util
 * @require M.MObjectUtil
 */


Mayjs.util.run(function(M) {
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

    function $include(obj, module, option) {
        var defauls = {
            "methodize": false,
            "context": null, //methodize的参数
            "methodizeTo": null, //methodize的参数
            //"alias": null 
            //"forceInclude": false
        };

        option = M.MObjectUtil.merge(defauls, option);

        /*if(!obj.__modules__){
            obj.__modules__ = [];
        }

        不判断是否已经包含了
        var includedModules = _collectIncludedModules(obj);
        if(includedModules.indexOf(module) != -1 && !option.forceInclude){
            return;
        }
        */

        var needMethodize = option.methodize;

        M.MObjectUtil.eachOwn(module, function(k, v){
            if("onIncluded" != k) {
                //var name = (option.alias && option.alias[k]) ? option.alias[k] : k;
                if(needMethodize && typeof v == "function") {
                    obj[k] = M.util.methodize(v, option.context, option.methodizeTo);
                } else {
                    obj[k] = v;
                }
            }
        });

        
        if(module.__interfaces__) {
            module.__interfaces__.forEach(function(interface_) {
                M.$implement(interface_, obj);
            });
        }

        //_registIncludedModule(obj, module, includedModules);

        if(module.onIncluded) {
            module.onIncluded.call(obj, option.context || obj);
        }
    }

    /*
    var _collectIncludedModules = function(obj){
        var modules = obj.__modules__;
        traverseChain(obj, "__proto__", function(proto){
            modules.concat(proto.__modules__);
        });
        return modules;
    };

    var _registIncludedModule = function(obj, module, includedModules){
        var objModules = obj.__modules__;

        var moduleItsModules = module.__modules__ || [];

        moduleItsModules.concat([module]).forEach(function(m){
            if(includedModules.indexOf(m) == -1){
                objModules.push(m);
            }
        });
    };
    */

    M.$module = $module;
    M.$include = $include;
}, Mayjs);