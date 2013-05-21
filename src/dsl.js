Mayjs.$run(function(Mayjs) {
    var util = Mayjs.util;

    Mayjs.dsl = {
        $: Mayjs.$,
        $$: Mayjs.$$,
        $checkParams: Mayjs.$checkParams,
        $class: Mayjs.$class,
        $def: util.def,
        $enum: util["enum"],
        $fn: util.fn,
        $global: Mayjs.$global,
        $interface: Mayjs.$interface,
        $module: Mayjs.$module,
        $run: Mayjs.$run,
        $obj: Mayjs.$obj,
        $is: Mayjs.$is,
        $implement: Mayjs.$implement
    };
    
    Mayjs.DSL = Mayjs.$dsl(Mayjs.dsl);

    Mayjs.MFunction = Mayjs.$module({
        overload: function(fn, overFnparamTypes, overFn) {
            var main = Mayjs.$overload(fn);
            main.overload(overFnparamTypes, overFn);
            return main;
        },
        paramNames: function(fn) {
            return util.parseParamNames(fn);
        },
        methodize: util.methodize
    });

    Mayjs.MObject = Mayjs.$module({
        trace: util.trace,
        clone: util.clone,
        merge: util.merge,
        mix: util.mix,
        dsl: Mayjs.$dsl,
        meta: Mayjs.meta.get,
        setMeta: Mayjs.meta.set,
        hasMeta: Mayjs.meta.has,
        forEach: util.forEach,
        support: function(obj, interface_) {
            return Mayjs.$support(interface_, obj);
        },
        implement: function(obj, interface_) {
            return Mayjs.$implement(interface_, obj);
        },
        is: function(obj, type) {
            return Mayjs.$is(type, obj);
        },
        include: function(obj, module, option) {
            return Mayjs.$include(module, obj, option);
        },
        overwrite: util.overwrite
    });

    Mayjs.init = function(option) {
        option = Mayjs.util.merge({
            "injectPrototype": true
        }, option);

        if(option.injectPrototype) {
            Mayjs.$include(Mayjs.MObject, Object.prototype, {
                "methodize": true,
                "context": null
            });
            Object.keys(Mayjs.MObject).forEach(function(k) {
                Mayjs.HOST[k] = undefined;
            });
            Mayjs.$include(Mayjs.MFunction, Function.prototype, {
                "methodize": true,
                "context": null
            });
        } else {
            Mayjs.$include(Mayjs.MObject, Mayjs.Base.prototype, {"methodize": true});

            Mayjs.$.regist(Object, Mayjs.MObject, {
                methodize: true
            });
            Mayjs.$.regist(Function, Mayjs.MFunction, {
                methodize: true
            });
        }
    };

}, Mayjs);