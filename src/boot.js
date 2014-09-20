var M=function(){
	if(arguments.length == 0){
		return M.importDSL();
	}else if(typeof arguments[0] == "function"){
		var wrapper = M.$wrapper();
		var args = Array.prototype.slice.call(arguments, 1);
		return arguments[0].apply(this, [wrapper.$, wrapper.$$].concat(args));
	}
}

M.global = this;
if(typeof global != "undefined")M.global = global;

if(typeof(module) != "undefined")module.exports = M;
