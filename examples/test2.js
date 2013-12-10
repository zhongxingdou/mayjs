Mayjs.$run(function(M) {
    eval(M.DSL());

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
        whoAmI: function() {
            var s = this.base();
            return s + " , i'm stronger than female";
        }
    });

    hal = new Male("hal");
    console.info(hal.name);
    console.info(hal.whoAmI());


    eval(M.$().DSL());

    StringWrapper = $module({
        "onIncluded": function() {},
        "toInteger": function(string, radix) {
            return parseInt(string, radix);
        },
        __this__: ["string", String.prototype],
        __option__: {methodize: true}
    });

    $use(StringWrapper);

    console.log($$("123Hello").toInteger(10) === 123);

    wrapper2 = $clone(StringWrapper);
    wrapper2.__this__ = [Animal];
    wrapper2.__option__ = {
        methodize: true,
        methodizeTo: function(obj) {
            return obj.name;
        }
    }

    $use(wrapper2);

    hal.name = "123" + hal.name;
    console.log($(hal).toInteger() == "123");

    var a = new String("123Hello");
    $a = $(a);
    console.log(!a.hasOwnProperty("toInteger"));
    console.log($a.hasOwnProperty("toInteger"));
    console.log($a != a);

    $$a = $$(a);
    console.log($$a == a);

    var fn = $overload($func(["string", "number"], function(name, age) {
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

    //test $check
    function abc(name, age){
        console.info($checkArgu("string", "number"));
    }

    abc("hal", 18);
    abc("hal", "18");
    console.info(M.parseArguNames(abc));
}, Mayjs);