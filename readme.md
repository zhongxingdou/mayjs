# <img src="https://raw.githubusercontent.com/zhongxingdou/mayjs/master/static/logo/logo.png" alt="Mayjs" />

[![Build Status](http://travis-ci.org/zhongxingdou/mayjs.png)](http://travis-ci.org/zhongxingdou/mayjs)
[![NPM version](https://badge.fury.io/js/mayjs.png)](http://badge.fury.io/js/mayjs)
[![Views](https://sourcegraph.com/api/repos/github.com/zhongxingdou/mayjs/counters/views-24h.png)](https://sourcegraph.com/github.com/zhongxingdou/mayjs)

[![NPM](https://nodei.co/npm/mayjs.png?downloads=true)](https://nodei.co/npm/mayjs/)

##Principle
+ Simple, but clear
+ Focus better javascript
+ Keep JavaScript as JavaScript

##Features
+ smart object wrapping(similary $() in jQuery but supported wrap any object )
+ methodize (provides a simple way to wrap pure function as members of object)
+ Module (inspirits by module of Ruby)
+ Classes and inheritance
+ Interfaces (for documentation implicit interface and validate object)
+ method overload and overwrite
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
## export May.js keyword-like function to global object
```javascript
M.exportDSL(M.global); 
//so you will got $class $module $interface $fn ...
```

## methodize
```javascript
//in may.js, 'Pure function' means the function which does not refer to this object
function capitalize(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
}

var china = new String("china"); //value type object can't have members

//string "china" will be binding as first parameter for capitalize
china.capitalize = $methodize(capitalize, china); 

china.capitalize(); //=> China
```

## Module
```javascript
var MEvent = $module({
    onIncluded: function(obj){
        obj.__observers = {};
    },
    subscribe: function(obj, eventName, observer){
        if(!obj.__observers[eventName]) obj.__observers[eventName] = [];
        obj.__observers[eventName].push(observer);
    },
    publish: function(obj, eventName, data){
        (obj.__observers[eventName] || []).forEach(function(observer){
            observer(data);
        });
    },
    __option__: {
        methodize: true
    }
});

var man = {};

$include(man, MEvent);

man.setName = function(name){
    this.name = name;
    this.publish("nameChanged", name);
}

man.subscribe("nameChanged", function(newName){
   console.info("name changed to:" + newName); 
});

man.setName("Hal"); //=> name changed to:Hal 
man.setName("Jerry"); //=> name changed to:Jerry 
```


##smart object wrap
```javascript
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


## Classes and inheritance
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

## Interface

### using interface to validate object
```javascript
M(function(){
    var Gender = $enum("Male","Female")

    var IStudent = $interface({
        name: String,
        birthday: Date,
        "[interest]": String
    });

    var Student = $class({
        initialize: function(studentInfo){
            $support(IStudent, studentInfo);
            $mix(this, studentInfo);
        }
    });

    var Jim = new Student({
        name: "Jim",
        birthday: new Date("1988/08/08")
    });

    var Lily = new Student({
        name: "Luly",
        birthday: new Date,
        interest: "swimming"
    });

    $ensure(function(){
        var Lucy = new Student({
            name: "Lucy",
            birthday: "1990/08/08"
        });
        // => error: birthday invlid
    });
});
```

### implementation interface
```javascript
M(function($, $$){
    var IMoveAble = $interface({
        move: Function
    });

    var Car = $class({
        initialize: function(name){
            this.name = name;
        },
        move: function(place){
            console.info(this.name + " is running to " + place);
        }
    });
    $implement(IMoveAble, Car.prototype);

    var Man = $class({
        initialize: function(name){
            this.name = name;
        },
        move: function(place){
            console.info(this.name + " is walking to " + place);
        }
    });
    $implement(IMoveAble, Man.prototype);
```
## register an module map to an interface
``` javascript
    //continued codeblock above
    var MoveStatus = $enum("Stoped", "Moving", "Arrived");

    var Marathon = $module({
        gotoPlace: function(obj, place, distance, secondsSpeed){
            obj.status = MoveStatus.Moving;
            obj.__moveTask ={
                place: place,
                distance: distance,
                speed: secondsSpeed,
                lastCounterTime: new Date 
            }
        },
        cancel: function(){
            obj.status = MoveStatus.Stoped;
        },
        checkStatus: function(obj){
            var task = obj.__moveTask;
            switch(obj.status){
                case MoveStatus.Stoped:
                    console.log(obj.name + ": Stoped");
                    break;
                case MoveStatus.Moving:
                    var movedSeconds = (new Date() - task.lastCounterTime) / 1000;
                    var movedDistance = Math.round(movedSeconds * task.speed * Math.random());
                    if(movedDistance < task.distance){
                        obj.move(task.place);
                        var remaining = task.distance - movedDistance;
                        console.log("   To " + task.place + " remaining: " + remaining);
                        task.distance = remaining; 
                        task.lastCounterTime = task.lastCounterTime;
                    }else{
                        obj.status = MoveStatus.Arrived;
                    }
                    break;
                case MoveStatus.Arrived:
                    console.info(obj.name + ": Arrived");
                    break;
            }
            return obj.status;
        },
        onIncluded: function(obj){
            obj.status = MoveStatus.Stoped;
        },
        __option__: {
            methodize: true
        }
    });

    $.reg(Marathon, IMoveAble);


    var toyota = new Car("Toyota");
    var liuXiang = new Man("LiuXiang");

    //liuXiang and toyota will wrapping by Marathon cause Car and Man both implementation IMoveAble 
    var marathonMan = $(liuXiang);
    var marathonCar = $(toyota);

    marathonCar.gotoPlace("Beijing",  3 * 1000, 20);
    marathonMan.gotoPlace("Home",  1 * 1000, 8);

    var timer = setInterval(function(){
        if(marathonMan.checkStatus() == MoveStatus.Arrived){
            console.info("==== LiuXiang Win ====")
            return clearInterval(timer);
        }
        if(marathonCar.checkStatus() == MoveStatus.Arrived){
            console.info("==== Toyota Win ====")
            clearInterval(timer);
        }
    }, 3000);
});
```
## method overload
may.js $overload() rely on interface and $is()

### lets write an tiny jQuery
```javascript
M(function($, $$){
    var supportCollectionFn = function(fn){
        return function(el){
            var self = this;
            var args = Array.prototype.slice.call(arguments, 1);
            if(el instanceof HTMLCollection || el instanceof NodeList){
                var result;
                Array.prototype.slice.call(el).forEach(function (item) {
                    result = fn.apply(self, [item].concat(args));
                });
                return result;
            }else{
                return fn.apply(self, arguments);
            }
        }
    }

    var DomHelper = {
        css: supportCollectionFn(function(el, cssProp, cssValue){
            el.style[cssProp] = cssValue;
            return this;
        }),
        html: supportCollectionFn(function(el, html){
            if(html){
                el.innerHTML = html;
            }else{
                return el.innerHTML;
            }
            return this;
        }),
        prop: supportCollectionFn(function(el, prop, propValue){
            if(propValue){
                el[prop] = propValue;
            }else{
                return el[prop];
            }
            return this;
        }),
        __option__: {
            supports: [Element, NodeList, HTMLCollection],
            methodize: true
        }
    }

    $.reg(DomHelper);

    var jjQuery = $overload([String], function(selector){
        return $(document.querySelectorAll(selector));
    }).overload([Element],function(el){
        return $(el);
    }).overload([HTMLCollection],function(els){
        return $(els);
    }).overload([String,Element], function(selector, parentElement){
        return $(parentElement.querySelectorAll(selector));
    }).overload([/^#[^ ]*/],function(id){
        return $(document.getElementById(id));
    });

    //we assume you have a html like below
    /*
        <div id="content"></div>
        <form id="myForm">
            <legend>Form1</legend>
            <fieldset>
                <label for="name">Name</label><input type="" id="name"/>
                <label for="age" >Age</label><input type="" id="age"/>
                <button>Save</button>
                <button>Reset</button>
            </fieldset>
        </form>
        <form id="myForm2">
            <legend>Form2</legend>
        </form>
     */

    jjQuery("#content").html("Hi, Mayjs!");
    jjQuery(document.body).css("backgroundColor","gray");
    jjQuery(document.forms).css("backgroundColor", "blue");
    jjQuery("button", document.forms[0]).prop("disabled", true);
    jjQuery("#myForm input").prop("backgroundColor", "yellow");
})
```



