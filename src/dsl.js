Mayjs.util.run(function(M) {
    M._ = M.$();
    M.run = function(fn){
        var args = [fn, M].concat(Array.prototype.slice.call(arguments, 1));
        return M.util.run.apply(this, args);
    }

    M.importDSL = function() {
        return M.util.dsl({
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
            _: M._
        });
    }
}, Mayjs);