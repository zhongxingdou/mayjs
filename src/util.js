M.util = {
    parseArguNames: function (fn) {
        var m = fn.toString().match(/.*?\((.*)?\)/);
        if(m && m[1]) {
            return m[1].split(",").map(function(i){ return i.trim();});
        }
        return [];
    },

    makeMultiTargetFn: function (fn){
        return function(){
            if(arguments.length <= 2){
                return fn(arguments[0], arguments[1]);
            }else{//3个以上
                var arg0 = arguments[0];
                for(var i=1, l=arguments.length; i<l; i++){
                    if(fn(arg0, arguments[i]) === false){
                        return false;
                    }
                }
                return true;
            }
        }
    },
    /**
     * 将一个值对象转换成引用对象
     * @memberof M
     * @param {Object} value
     * @return {Object}
     */
    toObject: function(value) {
        var obj = value;
        switch(typeof value){
            case 'string':
                obj = new String(value);
                break;
            case 'number':
                obj = new Number(value);
                break;
            case 'boolean':
                obj = new Boolean(value);
                break;
        }
        return obj;
    },

    /**
     * 调用方法自身
     * @memberof M
     * @return {Function}
     */

    fn: function() {
        return arguments.callee.caller.apply(this, arguments);
    },

    /**
     * 将类Array对象转换成Array
     * @memberof M
     * @param  {Object} arrayLikeObj
     * @return {Array}
     */

    parseArray: function(arrayLikeObj) {
        return Array.prototype.slice.call(arrayLikeObj, 0);
    },


    /**
     * 声明一个枚举
     * @memberof M
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
     * 将一个纯函数包装成指定对象的一个方法，并在此时设定纯函数的第一参数
     * @memberof M
     * @param  {Function} fn 纯函数
     * @param  {Object}   [firstParam=this] fn的第一个参数，如果没有getFirstParam的话
     * @param  {Function} [getFirstParam] 使用此函数获取fn的第一个参数，调用此函数时将把firstParam传递给它
     * @return {Function}
     */

    methodize: function(fn, firstParam, getFirstParam) {
        var slice = Array.prototype.slice;
        return function() {
            var obj = firstParam || this;
            var args = [getFirstParam ? getFirstParam(obj) : obj].concat(slice.call(arguments, 0));
            return fn.apply(this, args);
        };
    },
    
    methodize: function(fn, firstParam, getFirstParam) {
        return function() {
            //获取第一个参数
            var p1 = firstParam || this;
            if(getFirstParam) p1 = getFirstParam(p1);

            //把第一个参数和其他参数放在一起
            var slice = Array.prototype.slice;
            var args = [p1].concat(slice.call(arguments));

            return fn.apply(this, args);
        }
    },

    /**
     * overwrite对象的方法，新方法将调用指定的overwriter并把原方法当作第一个参数传递给它
     * @param  {Object} obj 被覆盖的对象
     * @param  {string} funcName   对象被覆盖的方法名
     * @param  {Function} overwriter 实际替代原方法的函数
     */
    overwrite: function(obj, funcName, overwriter) {
        var _baseFn = obj[funcName].bind(obj);
        obj[funcName] = function() {
            var args = [_baseFn].concat(Array.prototype.slice.call(arguments, 0));
            return overwriter.apply(this, args);
        };
    },


    /**
     * 生成供eval()函数将指定变量成员声明为当前作用域内变量的代码
     * 导入后会导致对象的方法调用时this变化
     * @memberof M
     * @param  {String} [obj=this]
     * @return {String}
     * @example
     * var Calculator = {
     *     add: function(a, b){ return a + b },
     *     sub: function(a, b){ return a - b }
     * }
     *
     * eval(dsl(Calculator));
     *
     * add(4, 6);
     * sub(10, 4);
     */

    dsl: function(obj, names) {
        obj = obj || this;

        var tempVarName =  "_temp" + Date.now() + Math.random().toString().substr(2);
        eval(tempVarName + "={value: {}}");

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
            //可以加入检查是否已经定义的功能，如已定义则警告。
            return name + "=" + tempVarName + ".value" + "['" + name + "']";
        });
        
        return "var " + members.join(",") + ";delete " + tempVarName + ";";
    },

    /**
     * 运行一个方法，一个快捷的使用闭包来避免全局变量的方法
     * @param  {Function} fn [description]
     * @return {[type]}      [description]
     */
    run: function(fn) {
        if(arguments.length == 1) {
            return fn();
        } else {
            return fn.apply(this, Array.prototype.slice.call(arguments, 1));
        }
    }
}
