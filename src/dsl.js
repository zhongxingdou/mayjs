Mayjs.$run(function(M) {
    var fn = M.util.fn;
    var enumeration = M.util.enumeration;
    var methodize = M.util.methodize;
    var merge = M.MObjectUtil.merge;
    var parseParamNames = M.util.parseParamNames;

    /*按字母顺序排序*/
    M.dsl = {
        $: M.$,
        $$: M.$$,
        $checkParams: M.$checkParams,
        $class: M.$class,
        $dsl: M.$dsl,
        $def: M.$def,
        $enum: enumeration,
        $fn: fn,
        $global: M.$global,
        $implement: M.$implement,
        $interface: M.$interface,
        $is: M.$is,
        $module: M.$module,
        $obj: M.$obj,
        $run: M.$run,
        $support: M.$support
    };
    
    M.DSL = function(){
        return M.$dsl(M.dsl);
    };

    M.MFunctionUtil = M.$module({
        overload: function(fn, overFnparamTypes, overFn) {
            var main = M.$overload(fn);
            main.overload(overFnparamTypes, overFn);
            return main;
        },
        paramNames: function(fn) {
            return parseParamNames(fn);
        },
        methodize: methodize
    });

    M.MObjectUtil = M.$module(M.MObjectUtil);
    M.MObjectUtil.mix(M.MObjectUtil, {
        meta: M.meta.get,
        setMeta: M.meta.set,
        hasMeta: M.meta.has,
        include: function(obj, module, option) {
            return M.$include(module, obj, option);
        },
        overwrite: M.util.overwrite
    });

    M.$include(M.MObjectUtil, M.Base.prototype, {
        "methodize": true
    });

    M.$.regist(Object, M.MObjectUtil, {
        "methodize": true
    });

    M.$.regist(Function, M.MFunctionUtil, {
        "methodize": true
    });
}, Mayjs);