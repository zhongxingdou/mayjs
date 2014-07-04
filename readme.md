<img src="static/logo/logo_light.png?raw=true" alt="Mayjs" />

# May.js 
>for writing powerful and clear JavaScript


[![Build Status](http://travis-ci.org/zhongxingdou/mayjs.png)](http://travis-ci.org/zhongxingdou/mayjs)
[![NPM version](https://badge.fury.io/js/mayjs.png)](http://badge.fury.io/js/mayjs)
[![Views](https://sourcegraph.com/api/repos/github.com/zhongxingdou/mayjs/counters/views-24h.png)](https://sourcegraph.com/github.com/zhongxingdou/mayjs)

[![NPM](https://nodei.co/npm/mayjs.png?downloads=true)](https://nodei.co/npm/mayjs/)

##principle
+ 简单，但清晰(simple, but clear)
+ 聚焦(focus)
+ 在干嘛重于如何干(What to do more then how to do)

##Features
+ Classes
+ Interfaces
+ Modules 
+ Object wrapper (wraps object as jQuery use $ to wrap document elements)
+ Global variables management
+ DSL (includes methods of any object into current scope)
+ Uniform type assert
+ Function overload
+ Method arguments validate and merge
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
			Mayjs.$run(function(M){
				eval(M());
				
				var Duck = $class({
					quack: function(){
						return "Quack quack!";
					}
				});
				
				console.info(new Duck().quack()); //Quack quack! 
			});
		</script>
	</head>
	<body>
	</body>
</html>
```

##Examples
###Classes and Interfaces
```javascript
Mayjs.$run(function(M){
    eval(M());
    
    var IAnimal = $interface({
        "move": [{"distance": Number}]
    });
    
    var IBird = $interface({
        "fly": []
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
    console.info(monkey.move(4)); //Animal: Monkey moved 4 step. 
    
    var poly = new Bird("Poly");
    console.info(poly.move(3)); //Bird: Animal: Poly moved 3 step.
    console.info(poly.fly()); //Bird: Animal: Poly is flying.
    
});

```

###Modules
```javascript
    //...previous code...
    
    var MRun = $module({
        onIncluded: function(animal){
            this.animal = animal;
            console.info(animal.getName() + " can run!");
        },
        run: function(){
            return this.animal.getName() + " is running!";
        }
    });
    
    monkey.include(MRun); //Animal: Monkey can run! 
    console.info(monkey.run()); //Animal: Monkey running! 
```

###Object wrapper
```javascript
    //...previous code...
   
    $.regist({"wrapper": MRun, "toWrap": IAnimal});
  
    //auto wrap animal with wrapper which was registed for IAnimal.
    console.info($(poly).run());
    
    poly.hasOwnProperty("poly"); //false
    
    //auto mix module MRun to poly 
    var poly2 = $$(poly);
    console.info(poly2.run());

    
    if(poly2 == poly){
        console.info("poly2 and poly is the same bird.");
    }
  
    var Human = $class({
        initialize: function(name){
            var _name = name || "";
            this.getName = function(){
                return  "Human: " + _name;
            };
        },
        move: function(distance){
            return this.getName() + " moved " + distance + " step.";
        }
    });
    
    $implement(IAnimal, Human.prototype);
    
    
    var MEat = $module({
        onIncluded: function(animal){
            console.info(animal.getName() + " can eat!");
        },
        eat: function(animal, food){
            return animal.getName() + " is eating " + food;
        }
    });
    
    $.regist({
    	"wrapper": MEat, 
    	"toWrap": IAnimal, 
    	"includeOption":{"methodize": true}
    });
       
    var lily = new Human("Lily");
    
    console.info($(lily).eat("apple"));
    //Human: Lily can run!
    //Human: Lily can eat!
    //Human: Lily is eating apple
```
###Global variables management
```javascript
    //...previous code...
    
    //list managed global variablers
    $global.list(); //["Mayjs"]
  
    console.info(typeof Jim); //undefined
    
    //declare a global variable
    $global("Jim", {"name": "Jim", "age": 18});
    $global.list(); //["Mayjs", "Jim"]
    
    console.info(Mayjs.HOST.Jim);
    console.info(Jim);
    
    //delete global variable
    $global.del("Jim");
    console.info(typeof Jim); //undefined
```
###DSL
```javascript
   //...previous code...
   
   var calc = {
   	add: function(a, b){
   	    return a+b;
   	},
   	sub: function(a, b){
   	   return a-b;
   	}
   }
   
   eval($dsl(calc));
   
   add(4, 3);
   sub(6, 3);
```

###Uniform type assert
```javascript
    //...previous code...
    
    console.assert($is("string", ""));
    console.assert($is(String, "") === false);
    console.assert($is(String, new String("")));

    console.assert($is("number", 8));
    console.assert($is("number", "8") === false);

    console.assert($is(Array, []));
    console.assert($is(Object, []));

    console.assert($is(Object, {}));
    console.assert($is(Object.prototype, {}));

    console.assert($is(IAnimal, monkey));
    console.assert($is(IAnimal, poly));
    console.assert($is(IAnimal, lily));

    console.assert($is(IBird, poly));

    console.assert($is(null, null));
    console.assert($is(null, undefined) === false);
```

