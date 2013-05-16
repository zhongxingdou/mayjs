/**
 * [overload description]
 * @require Mayjs.meta
 * @require Mayjs.interface
 * @type {Object}
 */

Mayjs.$run(function(Mayjs) {
    var meta = Mayjs.meta;
    var util = Mayjs.util;

    function _checkParams(fn, args) {
        var caller = fn || arguments.callee.caller;
        var paramsMeta = meta.get(caller, "paramspec");
        args = args || caller["arguments"];
        var type;
        for(var i = 0, l = args.length; i < l; i++) {
            type = paramsMeta[i].type;
            //将方法的参数声明为null类型，表明其可为任何值，所以总是验证通过
            if(type === null) return true;
            if(!Mayjs.$is(type, args[i])) {
                return false;
            }
        }
        return true;
    }

    function dispatch(overloads, args) {
        var l = args.length;

        var argsMeta = function(fn) {
                return meta.get(fn, "paramspec");
            };

        var matches = overloads.filter(function(fn) {
            return argsMeta(fn).length >= l;
        });
        if(matches.length <= 1) return matches[0];

        var orderedMatches = matches.sort(function(fn1, fn2) {
            return argsMeta(fn1).length - argsMeta(fn2).length;
        });

        var fn;
        while((fn = orderedMatches.shift())) {
            if(_checkParams(fn, args)) {
                return fn;
            }
        }
    }


    /**
     * function overload
     * @memberof Mayjs
     * @param {Array} paramsType params types
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


    function $overload(paramsType, fn) {
        //存储重载的方法
        var _overloads = [util.def(paramsType, fn)];

        var main = function() {
                var args = arguments;
                var fn = dispatch(_overloads, args);
                if(fn) {
                    return fn.apply(this, args);
                }
            };

        main.overload = function(argsMeta, fn) {
            _overloads.push(util.def(argsMeta, fn));
            return this;
        };

        return main;
    }

    Mayjs.$overload = $overload;
}, Mayjs);