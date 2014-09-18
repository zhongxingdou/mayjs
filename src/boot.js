var M=function(){
	if(arguments.length == 0){
		return M.importDSL();
	}else if(typeof arguments[0] == "function"){
		return M.run.apply(M, arguments);
	}
}

if(typeof(module) != "undefined")module.exports = M;
