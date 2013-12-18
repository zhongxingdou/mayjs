/**
 * @require M.util
 * @require M.MObjectUtil
 */


Mayjs.util.run(function(M) {
    /**
     * 定义一个part
     * @memberof M
     * @param  {Object} o
     * @return {Object}
     */

    function $part(o) {
        return o;
    }

    var IIncludeOption = {
        "[context]": Object,
        "[methdize]": Boolean,
        "[methdizeTo]": [Object]
    }

    var IPart = {
        "[__option__]": IIncludeOption,
        "[__supports__]": Array
    }

    /**
     * include part to obj with option
     * @memberof M
     * @param  {Object} opt.part
     * @param  {Object} opt.to
     * @param  {Object} opt.option
     * @return {Object}
     */

    function $include(obj, part, option) {
        var defauls = {
            "methodize": false,
            "context": null, //methodize的参数
            "methodizeTo": null //methodize的参数
        };

        option = M.MObjectUtil.merge(defauls, part.__option__, option);

        var needMethodize = option.methodize;

        M.MObjectUtil.eachOwn(part, function(k, v){
            if("onIncluded" != k && !k.match(/^__.*__$/)) {
                //var name = (option.alias && option.alias[k]) ? option.alias[k] : k;
                if(needMethodize && typeof v == "function") {
                    obj[k] = M.util.methodize(v, option.context, option.methodizeTo);
                } else {
                    obj[k] = v;
                }
            }
        });

        
        if(part.__interfaces__) {
            part.__interfaces__.forEach(function(interface_) {
                M.$implement(interface_, obj);
            });
        }

        if(part.onIncluded) {
            part.onIncluded.call(obj, option.context || obj);
        }
    }

    M.$part = $part;
    M.$include = $include;
}, Mayjs);