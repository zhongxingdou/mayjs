var MayjsUtil = {
    /**
     * 将一个值对象转换成引用对象
     * @memberof Mayjs
     * @param {Object} value
     * @return {Object}
     */
    toObject: function(value) {
        var type = typeof value;
        var obj = value;
        if(["object", "function"].indexOf(type) == -1) {
            var Type = eval(type.charAt(0).toUpperCase() + type.slice(1));
            obj = new Type(value);
        }
        return obj;
    },

    parseParamNames: function(fn) {
        var m = fn.toString().match(/.*?\((.*)?\)/);
        if(m && m[1]) {
            return m[1].split(",");
        }
        return [];
    },

    /**
     * 调用方法自身
     * @memberof Mayjs
     * @return {Function}
     */

    fn: function() {
        return arguments.callee.caller.apply(this, arguments);
    },

    /**
     * 将类Array对象转换成Array
     * @memberof Mayjs
     * @param  {Object} arrayLikeObj
     * @return {Array}
     */

    parseArray: function(arrayLikeObj) {
        return Array.prototype.slice.call(arrayLikeObj, 0);
    },


    /**
     * 声明一个枚举
     * @memberof Mayjs
     * @param {...String} names enumeration key
     * @example
     * var color = $enum("BLUE", "RED", "YELLOW");
     * color.BLUE
     * color.RED
     * color.YELLOW
     *
     * var color = $enum{{
     *  "BLUE": -1,
     *  "RED": 1
     * })
     */

    enumeration: function(names) {
        if(typeof names == "object") {
            return arguments[0];
        }

        var _enum = {};
        for(var i = 0, l = arguments.length; i < l; i++) {
            _enum[arguments[i]] = {};
        }

        return _enum;
    },


    /**
     * 将普通函数包装成一个方法，函数的第一个参数指向this
     * @memberof Mayjs
     * @param  {Function} fn pure function
     * @param  {Object}   [context=this] 第一个参数绑定到的对象
     * @param  {Function} [methodizeTo] 从context获取绑定对象的方法
     * @return {Function}
     */

    methodize: function(fn, context, methodizeTo) {
        var slice = Array.prototype.slice;
        return function() {
            var obj = context || this;
            var args = [methodizeTo ? methodizeTo(obj) : obj].concat(slice.call(arguments, 0));
            return fn.apply(null, args);
        };
    },

    overwrite: function(obj, funcName, overwriter) {
        var _baseFn = obj[funcName].bind(obj);
        obj[funcName] = function() {
            var args = [_baseFn].concat(Mayjs.util.parseArray(arguments));
            return overwriter.apply(obj, args);
        };
    },


    /**
     * 生成供eval()函数将指定变量成员声明为当前作用域内变量的代码
     * @memberof Mayjs
     * @param  {String} [obj=this]
     * @return {String}
     * @example
     * var Calculator = {
     *     add: function(a, b){ return a + b },
     *     sub: function(a, b){ return a - b }
     * }
     *
     * eval($var(Calculator));
     *
     * add(4, 6);
     * sub(10, 4);
     */

    $var: function(obj, names) {
        obj = obj || this;

        //create global tempObj
        var tempVarName = "_temp" + Date.now();
        eval(tempVarName + "={value: {}}");

        //get tempObj and set it's value with obj
        var temp = eval(tempVarName);
        temp.value = obj;

        if(typeof names == "string" && names !== ""){
            names = names.split(" ").map(function(n){ return n.trim(); });
        }else if(!names){
            names = Object.keys(obj);
        }

        //generate members declare string
        // var keys = Object.keys(obj).filter(function(k) {
            // return obj.hasOwnProperty(k) && typeof obj[k] == "function";
        // });

        var members = names.map(function(name) {
            return name + "=" + tempVarName + ".value" + "['" + name + "']";
        });
        return "var " + members.join(",") + "; delete " + tempVarName;
    },

    run: function(fn) {
        if(arguments.length == 1) {
            return fn();
        } else {
            return fn.apply(this, Array.prototype.slice.call(arguments, 1));
        }
    }

};

if(typeof Mayjs != "undefined" && Mayjs) {
    Mayjs.util = MayjsUtil;
    Mayjs.$run = MayjsUtil.run;
    Mayjs.$var = MayjsUtil.$var;
    Mayjs.$fn = MayjsUtil.fn;
    Mayjs.$enum = MayjsUtil.enumeration;
    MayjsUtil = undefined;
}