var Mayjs=function(){
	if(arguments.length == 0){
		return Mayjs.importDSL();
	}else if(typeof arguments[0] == "function"){
		return Mayjs.run.apply(Mayjs, arguments);
	}
}

if(typeof(module) != "undefined")module.exports = Mayjs;
