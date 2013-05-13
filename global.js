(function(HOST) {
    /**
     * 定义一个全局变量，如果已经定义了同名全局变量，将抛出错误<br>
     * !!!为了JSDoc能够生成文档而标记为一个类，不要使用new Mayjs.global()调用。
     * $global(name)在非全局环境中也可以吗？
     * @class Mayjs.global
     * @param  {String} globalName variable name
     * @param  {Object} [obj]
     */

    var $global = function(globalName, obj) {
            if($global.defined(globalName)) {
                throw globalName + " defined";
            } else {
                var o = obj || eval(globalName);
                HOST[globalName] = o;

                var variables = $global.__variables__;
                if(variables.indexOf(globalName) == -1) {
                    variables.push(globalName);
                }
            }
        };

    /**
     * 判断全局变量是否已经定义
     * @memberof Mayjs.global
     * @param  {String} globalName variable name
     * @return {Boolean}
     */
    $global.defined = function(globalName) {
        return HOST.hasOwnProperty ? HOST.hasOwnProperty(globalName) : typeof HOST[globalName] !== "undefined";
    };

    Object.defineProperty($global, "__variables__", {
        value: [],
        writable: true
    });

    /**
     * 删除一个全局变量，并移除注册信息
     * @memberof Mayjs.global
     * @param  {String} globalName variable name
     * @return {Boolean} 删除成功返回true，变量不存在或删除失败返回false
     */
    $global.del = function(globalName) {
        var i = this.__variables__.indexOf(globalName);
        if(i >= 0) {
            var variables = this.__variables__;
            this.__variables__ = variables.slice(0, i) + variables.slice(i + 1);
        }
        HOST[globalName] = null;
        delete HOST[globalName];
    };

    /**
     * 列举被管理的全局变量名
     * @memberof Mayjs.global
     * @return {String[]}
     */
    $global.list = function() {
        return [].concat(this.__variables__);
    };


    if(typeof(console) == "undefined") {
        console = {};
        ["info", "log", "error", "debug", "warn", "trace", "dir"].forEach(function(name) {
            console["name"] = function() {};
        });
    }

    var $run = function(fn) {
            if(arguments.length == 1) {
                return fn();
            } else {
                return fn.apply(this, Array.prototype.slice.call(arguments, 1));
            }
        };

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
     * eval(dsl(Calculator));
     *
     * add(4, 6);
     * sub(10, 4);
     */

    var $dsl = function(obj) {
            obj = obj || this;

            //create global tempObj
            var tempVarName = "_temp" + Date.now();
            eval(tempVarName + "={value: {}}");

            //get tempObj and set it's value with obj
            var temp = eval(tempVarName);
            temp.value = obj;

            //generate members declare string
            var keys = Object.keys(obj);
            var members = keys.map(function(name) {
                return name + "=" + tempVarName + ".value" + "['" + name + "']";
            });
            return "var " + members.join(",") + "; delete " + tempVarName;
        };

    $global("Mayjs", {
        "$global": $global,
        "$run": $run,
        "HOST": HOST,
        "$dsl": $dsl
    });
})(this);