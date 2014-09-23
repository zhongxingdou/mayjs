M.util.run(function(M){
    var $func = M.$func;

    function _checkParams(fn, params) {
        var caller = fn || arguments.callee.caller;
        var paramsMeta = caller.__argu_types__;
        params = params || caller["arguments"];
        var type;
        for(var i = 0, l = params.length; i < l; i++) {
            type = paramsMeta[i].type;
            //将方法的参数声明为null类型，表明其可为任何值，所以总是验证通过
            if(type === null) return true;
            if(!M.$ensure(function(){ return M._is(type, params[i]) })){
                return false;
            }
        }
        return true;
    }

    function dispatch(overloads, params) {
        var arguCount = params.length;

        var matches = overloads.filter(function(fn) {
            return fn.__argu_types__.length >= arguCount;
        });
        
        if(matches.length == 0) return null;

        var fn;
        while((fn = matches.shift())) {
            if(_checkParams(fn, params)) {
                return fn;
            }
        }
    }


    /**
     * function overload
     * @memberof M
     * @param {Array} paramsTypes params types
     * @param {function} fn overload function
     * @returns {function}
     * @example
     *   fn = M.$overload(["string","number"], function(name, age){
     *       return "I'm "+name+ " and I'm " + age + " years old";
     *   }).overload(["string"], function(name){
     *       return "i'm " + name;
     *   });
     *
     *   fn.overload(["string", "string"], function(name, interest){
     *       return "I'm " + name + ", and i'm interesting "+ interest;
     *   });
     *
     *   fn("lily"); // => "i'm lily"
     *   fn("lily", 18); // => "I'm lily and I'm 18 years old"
     *   fn("lily", "singing"); //=> "I'm lily, and i'm interesting singing"
     */
    function $overload(paramTypes, fn) {
        //存储重载的方法
        var _overloads = {};
        _overloads.value = [ typeof paramTypes == "function" ? paramTypes : $func(paramTypes, fn)];

        var main = function() {
                var params = arguments;
                var fn = dispatch(_overloads.value, params);
                if(fn) {
                    return fn.apply(this, params);
                }
            };

        main.overload = function(paramTypes, fn) {
            _overloads.value.push(typeof paramTypes == "function" ? paramTypes : $func(paramTypes, fn));
            _overloads.value = _overloads.value.sort(function(fn1, fn2) {
                return fn1.__argu_types__.length - fn2.__argu_types__.length;
            });

            return this;
        };


        return main;
    }

    M.$overload = $overload;
}, M);