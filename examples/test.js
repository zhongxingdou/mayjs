Mayjs.init({injectPrototype: false});
Mayjs.$run(function() {
    eval(Mayjs.DSL);

/*
    Animal = $class({
        myname: "Animal",
        initialize: function(name) {
            this.name = name;
        },
        whoAmI: function() {
            var s = "i'm " + this.name;
            return s;
        }
    });

    Human = Animal.extend({
        myname: "Human",
        initialize: function(name) {
            this.base(name);
            this.name = "Human " + this.name;
        }
    });

    Male = Human.extend({
        myname: "Male",
        initialize: function(name) {
            // this.proto().prototype.initialize.call(this, name);
            this.base(name); //等同于效率更高的this.prototype.prototype.initialize.call(this, name);
            this.name = "Male " + this.name;
        },
        whoAmI: function()      {
            var s = this.base();
            return s + " , i'm stronger than female";
        }
    });

    hal = new Male("hal");
    console.info(hal.name);
    console.info(hal.whoAmI());


    StringWrapper = $module({
        "onIncluded": function() {},
        "toInteger": function(string, radix) {
            return parseInt(string, radix);
        }
    });

    var types = ["string", String.prototype];

    types.forEach(function(type) {
        $.regist(type, StringWrapper, {"methodize": true});
    });

    console.log($$("123Hello").toInteger(10) === 123);

    $.regist(Animal, StringWrapper, {
        "methodize": true,
        "methodizeTo": function(obj) {
            return obj.name;
        }
    });
    hal.name = "123" + hal.name;
    console.log($(hal).toInteger() == "123");

    var a = new String("123Hello");
    $a = $(a);
    console.log(!a.hasOwnProperty("toInteger"));
    console.log($a.hasOwnProperty("toInteger"));
    console.log($a != a);

    $$a = $$(a);
    console.log($$a == a);*/

    var fn = $($def(["string", "number"], function(name, age) {
        console.info("I'm " + name + " and I'm " + age + " years old");
    })).overload(["string"], function(name) {
        console.info("i'm " + name);
    });

    fn.overload(["string", "string"], function(name, interest) {
        console.info("I'm " + name + ", and i'm interesting " + interest);
    }).overload({
            name: "string",
            age: "number",
            interesting: "string"
        }, function(opt) {
            console.info("I'm " + opt.name + " and I'm " + opt.age + " years old, and I'm interesting " + opt.interesting);
        }
    );

    fn("lily");
    fn("lily", 18);
    fn("lily", "singing");
    fn({
        name: "Lucy",
        age: 22,
        interesting: "swimming"
    });

    //test $checkParams
    function abc(name, age){
        console.info($checkParams("string", "number"));
    }

    abc("hal", 18);
    abc("hal", "18");
    console.info($(abc).paramNames());

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
    console.info(monkey.move(4));
    
    var poly = new Bird("Poly");
    console.info(poly.move(3));
    console.info(poly.fly());

    var Duck = $class({
        quack: function(){
            return "Quack quack!";
        }
    });

    console.info(new Duck().quack());

    var MRun = $module({
        onIncluded: function(animal){
            this.animal = animal;
            console.info(animal.getName() + " can run!");
        },
        run: function(){
            return this.animal.getName() + " is running!";
        }
    });
    
    monkey.include(MRun);
    console.info(monkey.run());


    $.regist(IAnimal, MRun);
  
    //auto wrap animal with wrapper which module registed for IAnimal.
    console.info($(poly).run());
    
    poly.hasOwnProperty("poly"); //false
    
    var poly2 = $$(poly);
    console.info(poly2.run());

    
    if(poly2 == poly){
        console.info("poly2 and poly were one and the same bird.");
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
    
    $.regist(IAnimal, MEat, {"methodize": true});
    
    var lily = new Human("Lily");
    
    console.info($(lily).eat("apple"));
    //Human: Lily can run!
    //Human: Lily can eat!
    //Human: Lily is eating apple


    //list managed global variablers
    $global.list(); //["Mayjs"]
  
    console.info("Jim is " + typeof Jim); //undefined
    
    //declare a global variable
    $global("Jim", {"name": "Jim", "age": 18});
    $global.list(); //["Mayjs", "Jim"]
    
    console.info(Jim);
    console.info(Mayjs.HOST.Jim);
    
    //delete global variable
    $global.del("Jim");
    console.info(typeof Jim); //undefined

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

    var calc = {
        add: function(a, b){
            return a+b;
        },
        sub: function(a, b){
            return a-b;
        }
    };
   
   eval($dsl(calc));
   
   add(4, 3);
   sub(6, 3);

});
