#May.js

##feature
###global variable manager

```
javascript

(function(HOST){
	var Mayjs = {};
	$global("Mayjs");
	HOST["Mayjs"] == Mayjs // true

	$global.list(); // ["Mayjs"]
	
	$global("Mayjs", {}); // throw "Mayjs has defined";

	$global.del("Mayjs") 
	typeof(Mayjs) // "undefined"
})(this);

```

### 
