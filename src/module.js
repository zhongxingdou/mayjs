M.util.run(function(M) {
    /**
     * 定义一个module，暂时啥也不干，原样返回传入的对象，标识作用
     * @memberof M
     * @param   {Object} obj
     * @returns {Object}
     */
    function $module(o) {
        return o;
    }

    /**
     * 供include module时使用的选项的接口
     * @memberof M
     * @interface
     */
    var IModuleOption = {
        //执行onincluded和methodize时会用到
        "[context]": Object,

        //是否对所有函数成员进行methodize
        "[methdize]": Boolean,

        //通过这个函数获得methodize时的第一参数
        "[methdizeTo]": [Object],

        //可以被mix到哪些类型
        "[supports]": Array,

        //停止调用module.onIncluded
        "[stopCallback]": Boolean
    }

    /** 
    * module interface
    * @memberof M
    * @interface
    **/
    var IModule = {
        "[__option__]": IModuleOption,
        "[onIncluded]": Function //include给object后被自动调用，一般不用于include给prototype object
    }

    /**
     * include module to obj with option
     * @memberof M
     * @param  {Object} opt.module
     * @param  {Object} opt.to
     * @param  {Object} opt.option
     * @returns {Object}
     */
    function $include(obj, module, option) {
        var defauls = {
            "methodize": false,
            "context": null, //methodize的参数
            "methodizeTo": null, //methodize的参数
            "stopCallback": false
        };

        option = M.MObjectUtil.merge(defauls, module.__option__, option);

        var needMethodize = option.methodize;

        M.MObjectUtil.eachOwn(module, function(k, v){
            if("onIncluded" !== k && !k.match(/^__.*__$/)) {
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

        if(!option.stopCallback && module.onIncluded) {
            module.onIncluded.call(obj, option.context || obj);
        }
    }

    M.$module = $module;
    M.$include = $include;
    M.IModuleOption =  IModuleOption;
    M.IModule = IModule;
}, M);