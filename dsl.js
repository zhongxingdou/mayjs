Mayjs.dsl = Mayjs.$run(function(Mayjs) {
    var util = Mayjs.util;

    var dsl = {
        $obj: function(a) {
            var o = new this.Base();
            Mayjs.util.mix(a, o);
            return o;
        },

        $meta: function(obj, name) {
            return Mayjs.meta.get(obj, name);
        }
    };

    var utilExcludes = ["parseParamNames", "def"];
    Object.keys(util).forEach(function(name) {
        if(utilExcludes.indexOf(name) == -1)
            dsl["$" + name] = util[name];
    });

    Object.keys(Mayjs).forEach(function(name) {
        if(/^\$/.test(name)){
            dsl[name] = Mayjs[name];
        }
    });

    return dsl;
}, Mayjs);

Mayjs.DSL = Mayjs.$dsl(Mayjs.dsl);