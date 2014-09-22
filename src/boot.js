/**
* 执行fn并把一个新的Wrapper的$()和$$()传递给它
* 如果没有传递任何参数，则执行{@link M.exportDSL}
* @namespace {Function} M
* @param {Function} [fn] 
*/
var M=function(fn){
	if(arguments.length == 0){
		return M.exportDSL();
	}else if(fn){
		var wrapper = M.$wrapper();
		var args = Array.prototype.slice.call(arguments, 1);
		return fn.apply(this, [wrapper.$, wrapper.$$].concat(args));
	}
}

/**
* 引用当前运行环境的全局对象
* 浏览器中指向window，node环境下指向global
*/
M.global = this;
if(typeof global != "undefined")M.global = global;

/**
* 将May.js的关键字方法复制到目标对象
* 如果未传递target参数，则使用eval()导出到当前作用域内
* @param {Object} [target] 目标对象
*/
M.exportDSL = function(target) {
    var _getKeywordFunc = function(){
        return Object.keys(M).filter(function(name){
            return (/^\$/).test(name) && ["$", "$$"].indexOf(name) == -1;
        });
    }

    if(target){
        _getKeywordFunc().forEach(function (prop) {
            target[prop] = M[prop];
        });
    }else{
        return M.util.dsl(M, _getKeywordFunc()) + M.util.dsl(M.$wrapper());
    }
}

if(typeof(module) != "undefined")module.exports = M;
