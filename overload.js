/**
 * [overload description]
 * @require Mayjs.meta
 * @require Mayjs.interface
 * @type {Object}
 */
Mayjs.overload = {
    dispatch: function(overloads, args) {
        var l = args.length;

        var argsMeta = function(fn) {
                return Mayjs.meta.get(fn, "paramspec");
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
            if(Mayjs.interface_.checkParams(fn, args)) {
                return fn;
            }
        }
    },

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

    overload: function(paramsType, fn) {
        var self = Mayjs.overload;
        //存储重载的方法
        var _overloads = [Mayjs.interface_.def(paramsType, fn)];

        var main = function() {
                var args = arguments;
                var fn = self.dispatch(_overloads, args);
                if(fn) {
                    return fn.apply(this, args);
                }
            };

        main.overload = function(argsMeta, fn) {
            _overloads.push(Mayjs.interface_.def(argsMeta, fn));
            return this;
        };

        return main;
    }
};