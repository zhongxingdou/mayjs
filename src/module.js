/**
 * @require M.util
 * @require M.MObjectUtil
 */
M.util.run(function(M) {
    /**
     * 定义一个module
     * @memberof M
     * @param  {Object} o
     * @return {Object}
     */

    function $module(o) {
        return o;
    }

    var IIncludeOption = {
        "[context]": Object,
        "[methdize]": Boolean,
        "[methdizeTo]": [Object]
    }

    var Imodule = {
        "[__option__]": IIncludeOption,
        "[__supports__]": Array,
        "[init]": Function, //include给Class的prototype后，在Class的constructor内手动调用M.init.call(this)，方便传递类的实例
        "[onIncluded]": Function //include给object后被自动调用，一般不用于include给prototype object
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
            "methodizeTo": null //methodize的参数
        };

        option = M.MObjectUtil.merge(defauls, module.__option__, option);

        var needMethodize = option.methodize;

        M.MObjectUtil.eachOwn(module, function(k, v){
            if("init" !== k && "onIncluded" !== k && !k.match(/^__.*__$/)) {
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

        if(module.onIncluded) {
            module.onIncluded.call(obj, option.context || obj);
        }
    }

    M.$module = $module;
    M.$include = $include;
}, M);