Mayjs.$run(function(M) {
    var fn = M.util.fn;
    var enumeration = M.util.enumeration;
    var methodize = M.util.methodize;
    var parseParamNames = M.util.parseParamNames;

    var merge = M.MObjectUtil.merge;
    var mix = M.MObjectUtil.mix;

    /*按字母顺序排序*/
    M.dsl = {
        $: M.$,
        $$: M.$$,
        $check: M.$check,
        $class: M.$class,
        $clone: M.$clone,
        $var: M.$var,
        $def: M.$def,
        $enum: enumeration,
        $fn: fn,
        $global: M.$global,
        $implement: M.$implement,
        $interface: M.$interface,
        $is: M.$is,
        $merge: merge,
        $mix: mix,
        $module: M.$module,
        $obj: M.$obj,
        $run: M.$run,
        $support: M.$support
    };

    M.DSL = function() {
        return M.$var(M.dsl);
    };

    M.MFunctionWrapper = M.$module({
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

    var MObjectExtend = {
        meta: M.meta.get,
        setMeta: M.meta.set,
        hasMeta: M.meta.has,
        include: function(obj, module, option) {
            return M.$include({
                "module": module,
                "to": obj,
                "option": option
            });
        },
        overwrite: M.util.overwrite
    };

    M.$include({
        "module": MObjectExtend,
        "to": M.Base.prototype,
        "option": {
            "methodize": true
        }
    });

    M.$include({
        "module": M.MObjectUtil,
        "to": M.Base.prototype,
        "option": {
            "methodize": true
        }
    });

    M.MObjectWrapper = {
        set: function(o, name, value) {
            o[name] = value;
            return o;
        },
        get: function(o, name) {
            return o[name];
        },
        call: function(o, fn) {
            fn = o[fn];
            var args = util.parseArray(arguments).split(2);
            return fn.apply(o, args);
        }
    };
    
    M.$include({
        "module": M.MObjectUtil,
        "to": M.MObjectWrapper
    });

    M.$include({
        "module": MObjectExtend,
        "to": M.MObjectWrapper
    });

    M.$.regist({
        "wrapper": M.MObjectWrapper,
        "toWrap": Object,
        "includeOption": {
            "methodize": true
        }
    });

    M.$.regist({
        "wrapper": M.MFunctionWrapper,
        "toWrap": Function,
        "includeOption": {
            "methodize": true
        }
    });
}, Mayjs);