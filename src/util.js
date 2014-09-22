/** @namespace M.util **/
M.util = {
    /**
    * 获取函数的参数名称
    * @example
    * function Add(number1, number2){}
    * M.util.parseArguNames(Add);
    * => ["number1", "number2"]
    * @param {function} fn
    * @returns {Array}
    */
    parseArguNames: function (fn) {
        var m = fn.toString().match(/.*?\((.*)?\)/);
        if(m && m[1]) {
            return m[1].split(",").map(function(i){ return i.trim();});
        }
        return [];
    },

    /**
    * 包装只有两个参数的函数, 包装后会把第二个参数开始的所有参数依次传递给原函数运行
    * @param {function(param, param2)} fn
    * @returns {function}
    */
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
     * 将值转换成其对应的引用对象
     * @param {string|number|bool} value
     * @returns {Object}
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

    /** 在函数内部调用函数自身, 代替引用auguments.callee **/
    fn: function() {
        return arguments.callee.caller.apply(this, arguments);
    },

    /**
     * 将类Array对象转换成真正的Array
     * @param  {Object} arrayLikeObj
     * @returns {Array}
     */
    parseArray: function(arrayLikeObj) {
        return Array.prototype.slice.call(arrayLikeObj, 0);
    },


    /**
     * 声明一个枚举
     * @param {...String} names enumeration key
     * @example
     * var color = M.$enum("BLUE", "RED", "YELLOW");
     * color.BLUE
     * color.RED
     * color.YELLOW
     *
     * var color = M.$enum({
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
     * 包装纯函数，包装时指定纯函数的第一参数
     * @param  {function} fn 纯函数
     * @param  {Object}   [firstParam=this] fn的第一个参数，如果未传递getFirstParam参数
     * @param  {function(firstParam)} [getFirstParam] 获取fn的第一个参数的函数，调用时将把firstParam传递给它
     * @return {function}
     */
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
     * 重写对象的方法，新方法将调用overwriter并把原方法作为第一个参数传递给它
     * @param  {Object} obj 要重写方法的对象 
     * @param  {string} funcName 被重写的方法名
     * @param  {function} overwriter 真正的覆盖函数
     * @example
     * var Jim = {
     *     sayHi: function(){ return "Hi"}
     * }
     *
     * M.util.overwrite(Jim, "sayHi", function(oldFn, name){
     *     return oldFn.call(this) + ", " + name + "!";
     * })
     * 
     * Jim.sayHi("Lucy");
     * => "Hi, Lucy!"
     */
    overwrite: function(obj, funcName, overwriter) {
        var _oldFn = obj[funcName].bind(obj);
        obj[funcName] = function() {
            var args = [_oldFn].concat(Array.prototype.slice.call(arguments, 0));
            return overwriter.apply(this, args);
        };
    },

    /**
     * 生成将对象的成员导出到当前作用域的代码，该代码可被eval()正确执行,
     * 该函数生成的代码不能在strict模式下运行
     * @param  {string} [obj=this]
     * @param {string} [members] 指定要导入的成员，未指定则导入全部成员，用空格分隔成员名
     * @return {string}
     * @example
     * var Calculator = {
     *     add: function(a, b){ return a + b },
     *     sub: function(a, b){ return a - b }
     * }
     *
     * eval(M.util.dsl(Calculator));
     *
     * add(4, 6);
     * sub(10, 4);
     */
    dsl: function(obj, members) {
        obj = obj || this;

        var tempVarName =  "_temp" + Date.now() + Math.random().toString().substr(2);
        eval(tempVarName + "={value: {}}");

        var temp = eval(tempVarName);
        temp.value = obj;


        if(typeof members == "string" && members !== ""){
            members = members.split(" ").map(function(n){ return n.trim(); });
        }else if(!members){
            members = Object.keys(obj);
        }

        var codes = members.map(function(name) {
            //可以加入检查是否已经定义的功能，如已定义则警告。
            return name + "=" + tempVarName + ".value" + "['" + name + "']";
        });
        
        return "var " + codes.join(",") + ";delete " + tempVarName + ";";
    },

    /**
     * 运行指定方法，避免在全局作用域下产生全局变量
     * @param {function} fn
     */
    run: function(fn) {
        if(arguments.length == 1) {
            return fn();
        } else {
            return fn.apply(this, Array.prototype.slice.call(arguments, 1));
        }
    }
}

/** 
 * 在函数内部调用函数自身, 代替引用auguments.callee，是{@link M.util.fn}的别名
 * @memberof M
 * @function
 **/
M.$fn = M.util.fn;

/**
 * 运行指定方法，避免在全局作用域下产生全局变量，是{@link M.util.run}的别名
 * @memberof M
 * @function
 * @param {function} fn
 */
M.$run = M.util.run;

/**
 * 声明一个枚举，是{@link M.util.enumeration}的别名
 * @memberof M
 * @function
 * @param {...String} names enumeration key
 * @example
 * var color = M.$enum("BLUE", "RED", "YELLOW");
 * color.BLUE
 * color.RED
 * color.YELLOW
 *
 * var color = M.$enum({
 *  "BLUE": -1,
 *  "RED": 1
 * })
 */
M.$enum = M.util.enumeration;

/**
 * 重写对象的方法，新方法将调用overwriter并把原方法作为第一个参数传递给它，是{@link M.util.overwrite}的别名
 * @memberof M
 * @function
 * @param  {Object} obj 要重写方法的对象 
 * @param  {string} funcName 被重写的方法名
 * @param  {function} overwriter 真正的覆盖函数
 * @example
 * var Jim = {
 *     sayHi: function(){ return "Hi"}
 * }
 *
 * M.util.overwrite(Jim, "sayHi", function(oldFn, name){
 *     return oldFn.call(this) + ", " + name + "!";
 * })
 * 
 * Jim.sayHi("Lucy");
 * => "Hi, Lucy!"
 */
M.$overwrite = M.util.overwrite;

/**
 * 包装纯函数，包装时指定纯函数的第一参数，是{@link M.util.methodize}的别名
 * @memberof M
 * @function
 * @param  {function} fn 纯函数
 * @param  {Object}   [firstParam=this] fn的第一个参数，如果未传递getFirstParam参数
 * @param  {function(firstParam)} [getFirstParam] 获取fn的第一个参数的函数，调用时将把firstParam传递给它
 * @return {function}
 */
M.$methodize = M.util.methodize;

/**
 * 生成将对象的成员导出到当前作用域的代码，该代码可被eval()正确执行,
 * 该函数生成的代码不能在strict模式下运行，是{@link M.util.dsl}的别名
 * @memberof M
 * @function
 * @param  {string} [obj=this]
 * @param {string} [members] 指定要导入的成员，未指定则导入全部成员，用空格分隔成员名
 * @return {string}
 * @example
 * var Calculator = {
 *     add: function(a, b){ return a + b },
 *     sub: function(a, b){ return a - b }
 * }
 *
 * eval(M.util.dsl(Calculator));
 *
 * add(4, 6);
 * sub(10, 4);
 */
M.$dsl = M.util.dsl;
