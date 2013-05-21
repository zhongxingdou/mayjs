#May.js 
>for writing powerful and clearly JavaScript code


##Features
---
+ Classes
+ Interfaces
+ Modules 
+ Object Wrapper (wraps object like jQuery use $ to wrap document elements)
+ Global variable management
+ Function overload
+ Uniform type assert
+ Method arguments validate and merge
+ DSL (includes methods of any object into current scope)
+ Keyword methods (Some usefully methods to rescue JavaScript ugly syntax and weakness)

##Getting started
---
The quickest way to start using May.js in your project, is by simply including may.js

```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<script src="may.js"></script>
		<script>
			Mayjs.$run(function(){
				eval(Mayjs.DSL);
				
				var Duck = $class({
					sayHello: function(){
						return "Quack quack!";
					}
				});
				
				new Duck().sayHello();
			});
		</script>
	</head>
	<body>
	</body>
```