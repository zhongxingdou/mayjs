Mayjs.util.run(function(M) {
    M.run = function(fn){
        var wrapper = M.$wrapper();
        M.MObjectUtil.mix(M.DSL, wrapper);

        var args = [fn, M].concat(Array.prototype.slice.call(arguments, 1));
        try{
            var result = M.util.run.apply(this, args);
        }catch(e){
            throw e;
        }finally{
            Object.keys(wrapper).forEach(function(k){
                delete M.DSL[k];
            });
        }
        return result;
    }

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
        $wrapper: M.$wrapper
    }

    M.importDSL = function() {
        return M.util.dsl(M.DSL);
    }
}, Mayjs);