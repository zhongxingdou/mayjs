Mayjs.$run(function() {
    eval(Mayjs.DSL());

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
