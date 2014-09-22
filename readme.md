# <img src="https://raw.githubusercontent.com/zhongxingdou/mayjs/master/static/logo/logo.png" alt="Mayjs" />

[![Build Status](http://travis-ci.org/zhongxingdou/mayjs.png)](http://travis-ci.org/zhongxingdou/mayjs)
[![NPM version](https://badge.fury.io/js/mayjs.png)](http://badge.fury.io/js/mayjs)
[![Views](https://sourcegraph.com/api/repos/github.com/zhongxingdou/mayjs/counters/views-24h.png)](https://sourcegraph.com/github.com/zhongxingdou/mayjs)

[![NPM](https://nodei.co/npm/mayjs.png?downloads=true)](https://nodei.co/npm/mayjs/)

##principle
+ Simple, but clear
+ Focus better javascript
+ Keep javascript as javascript

##Features
+ smart object wrap (wrapping any object like $() in jQuery)
+ Module (inspirits by module of Ruby)
+ Classes and inheritance
+ Interfaces (for documentation implicit interface and validate object)
+ methodize (provides a simple way to make a pure function as members of an object)
+ function overload
+ keyword-like function (a series of function to simplify complex expressions and repetitive code)

##Getting started
The quickest way to start using May.js in your project, is by simply including may.js

```html
<!DOCTYPE html>
<html>
	<head>
		<script src="may.js"></script>
		<script>
			M(function($, $$){
                $.reg({
                    capitalize: function(){
                        var s = this.valueOf();
                        return s.charAt(0).toUpperCase() + s.slice(1);
                    }
                }, String);

                alert($("china").capitalize()); //china => China
			});
		</script>
	</head>
	<body>
	</body>
</html>
```

##smart object wrap
```javascript
//export May.js keyword-like function to global object
M.exportDSL(); //so you will got $class $module $interface $fn ...

//register a global wrapper
M.$.reg({
    mix: function(obj, src){
        for(var p in src){ obj[p] = src[p] }
    }, 
    __option__: {
        methodize: true,
        supports: [Object]
    }
});

M(function($, $$){
    //$() and $$() both use the same wrapper table

    var Jim = {};
    $(Jim).mix({
        name: "Jim",
        age: 20
    });

    Jim.name; //=> Jim
    Jim.hasOwnProperty("mix"); //=> false
    typeof(Jim.mix); //=> undefined

    $$(Jim); //copy mix() to Jim directly
    Jim.hasOwnProperty("mix"); //=> true

    //register a wrapper locally
    $.reg({
        next: function(num){
            return num + 1;
        },
        __option__: {methodize: true}
    }, Number);

    $(8).next(); //=> 9
})

M.$(8).next() //oh, No!
```


###Classes and inheritance
```javascript
M(function(){
    var Animal = $class({
        initialize: function(name){
            var _name = name || "";
            this.getName = function(){
                return _name;
            }
        },
        eat: function(food){
            return this.getName() + " is eating " + food;
        }
    });
    
    var Duck = Animal.extend({
        initialize: function(name){
            this.base(name);
        },
        eat: function(food){
            return this.base(food) + ", she is so happy: quack quack!"
        }
    });
    
    var monkey = new Animal("monkey");
    monkey.eat("banana"); // => monkey is eating banana
    
    var duck = new Duck("Litter yellow duck");
    duck.eat("grass"); // => Little yellow duck is eating grass, she is so happy: quack quack!
});
```
