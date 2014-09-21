var M=function(){
	if(arguments.length == 0){
		return M.exportDSL();
	}else if(typeof arguments[0] == "function"){
		var wrapper = M.$wrapper();
		var args = Array.prototype.slice.call(arguments, 1);
		return arguments[0].apply(this, [wrapper.$, wrapper.$$].concat(args));
	}
}

M.global = this;
if(typeof global != "undefined")M.global = global;

if(typeof(module) != "undefined")module.exports = M;

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
