M.util.run(function(M) {
    M.DSL = {
        $checkArgu: M.$checkArgu,
        $class: M.$class,
        $clone: M.MObjectUtil.clone,
        $func: M.$func,
        $enum: M.util.enumeration,
        $fn: M.util.fn,
        $include: M.$include,
        $implement: M.$implement,
        $interface: M.$interface,
        $is: M.$is,
        $merge: M.MObjectUtil.merge,
        $mix: M.MObjectUtil.mix,
        $module: M.$module,
        $obj: M.$obj,
        $run: M.util.run,
        $support: M.$support,
        $overload: M.$overload,
        $overwrite: M.util.overwrite,
        $methodize: M.util.methodize,
        $wrapper: M.$wrapper,
        $dsl: M.util.dsl,
        $check: M.$check
    }


    M.importDSL = function() {
        return M.util.dsl(M.DSL) + M.util.dsl(M.$wrapper());
    }

    M.exportToGlobal = function(){
        M.MObjectUtil.mix(M.global, M.DSL);
    }
}, M);