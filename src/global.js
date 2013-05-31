$global = (function(HOST) {
    /**
     * 定义一个全局变量，如果已经定义了同名全局变量，将抛出错误<br>
     * !!!为了JSDoc能够生成文档而标记为一个类，不要使用new Mayjs.global()调用。
     * $global(name)在非全局环境中也可以吗？
     * @class Mayjs.global
     * @param  {String} globalName variable name
     * @param  {Object} [obj]
     */

    var $global = function(globalName, obj) {
            var _global = arguments.callee;
            if(_global.defined(globalName)) {
                throw globalName + " has been defined";
            } else {
                var o = obj || eval(globalName);
                HOST[globalName] = o;
                _global.regist(globalName);
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
            this.__variables__ = variables.slice(0, i).concat(variables.slice(i + 1));
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

    $global.regist = function(globalName){
        if(!this.defined(globalName)){
            throw globalName + " is undefined";
        }
        var variables = this.__variables__;
        if(variables.indexOf(globalName) == -1) {
            variables.push(globalName);
        }
    };

    return $global;
})(this);

if(typeof Mayjs != "undefined" && Mayjs) {
    Mayjs.$global = $global;
    Mayjs.$global.regist("Mayjs");
    $global = undefined;
}