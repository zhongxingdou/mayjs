#May.js 
>for writing powerful and clearly JavaScript code


##Features
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
					quack: function(){
						return "Quack quack!";
					}
				});
				
				new Duck().quack();
			});
		</script>
	</head>
	<body>
	</body>
</html>
```

##Examples
###Classes
```javascript
Mayjs.$run(function(){
    eval(Mayjs.DSL);
    var IAnimal = $interface({
        "move": [{"distance": Number}]
    });
    
    var IBird = $interface({
        "fly": [{"distance": Number}]
    }, IAnimal);
    
    
    var Animal = $class({
        initialize: function(name){
            var _name = name || "";
            this.getName = function(){
                return  "Animal: " + _name;
            };
        },
        move: function(distance){
            return this.getName() + " moved " + distance + " step.";
        }
    });
    $implement(IAnimal, Animal.prototype);
    
    var Bird = Animal.extend({
        initialize: function(name){
            this.base(name);
            this.overwrite("getName", function(base){
                    return "Bird: " + base();
            });
        },
        fly: function(){
            return this.getName() + " is flying.";
        }
    });
    $implement(IBird, Bird.prototype);
    
    
    var monkey = new Animal("Monkey");
    console.info(monkey.move(4));
    
    var poly = new Bird("Poly");
    console.info(poly.move(3));
    console.info(poly.fly());
    
});

```