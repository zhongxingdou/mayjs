Mayjs.util.run(function(M) {

    /**
    * invoke fn always pass Mayjs as it's first parameter and
    * create an unique wrapper for Mayjs.DSL which will auto remove after fn invoked
    * so that wrapper avaiable in fn's inner only.
    * @example
    * Mayjs.run(function(M, p1, p2){
    *   console.info(M);
    *   console.info(p1);
    *   console.info(p2);
    *   //M.$
    *   //M.$$
    *   //M.using
    * }, 'p1', 'p2');
    */
    M.run = function(fn){
        var wrapper = M.$wrapper();

        //copy member of wrapper to M.DSL
        M.MObjectUtil.mix(M.DSL, wrapper);

        var args = [fn, M].concat(Array.prototype.slice.call(arguments, 1));
        try{
            var result = M.util.run.apply(this, args); //call fn with [Mayjs, args...]
        }catch(e){
            throw e;
        }finally{
            //remove members of M.DSL which come from wrapper
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
        $part: M.$part,
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