/**
 * [overload description]
 * @require M.meta
 * @require M.interface
 * @type {Object}
 */

Mayjs.util.run(function(M){
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
            if(!M.$is(type, params[i])) {
                return false;
            }
        }
        return true;
    }

    function dispatch(overloads, params) {
        var l = params.length;

        var paramTypes = function(fn) {
                return fn.__argu_types__;
            };

        var matches = overloads.filter(function(fn) {
            return paramTypes(fn).length >= l;
        });
        
        if(matches.length == 1 && _checkParams(matches[0], params)){
            return matches[0];
        }else if(matches.length == 0){
            return null;
        }

        //这个可以移入overload中，没有必要每次排序
        var orderedMatches = matches.sort(function(fn1, fn2) {
            return paramTypes(fn1).length - paramTypes(fn2).length;
        });

        var fn;
        while((fn = orderedMatches.shift())) {
            if(_checkParams(fn, params)) {
                return fn;
            }
        }
    }


    /**
     * function overload
     * @memberof M
     * @param {Array} paramsTypes params types
     * @param {Function} fn overload function
     * @return {Function}
     * @example
     *   fn = $overload(["string","number"], function(name, age){
     *       return "I'm "+name+ " and I'm " + age + " years old";
     *   }).$overload(["string"], function(name){
     *       return "i'm " + name;
     *   });
     *
     *   fn.$overload(["string", "string"], function(name, interest){
     *       return "I'm " + name + ", and i'm interesting "+ interest;
     *   });
     *
     *   fn("lily");
     *   fn("lily", 18);
     *   fn("lily", "singing");
     */


    function $overload(paramTypes, fn) {
        //存储重载的方法
        var _overloads = [ typeof paramTypes == "function" ? paramTypes : $func(paramsTypes, fn)];

        var main = function() {
                var params = arguments;
                var fn = dispatch(_overloads, params);
                if(fn) {
                    return fn.apply(this, params);
                }
            };

        main.overload = function(paramTypes, fn) {
            _overloads.push(typeof paramTypes == "function" ? paramTypes : $func(paramTypes, fn));
            return this;
        };
        return main;
    }

    M.$overload = $overload;
}, Mayjs);