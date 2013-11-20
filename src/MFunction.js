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

