Mayjs.dsl = Mayjs.$run(function(Mayjs, HOST) {
    var util = Mayjs.util;

    var dsl = {
        //使用$({})代替
        // $obj: function(a) {
            // var o = new this.Base();
            // Mayjs.util.mix(a, o);
            // return o;
        // },

        //使用obj.meta obj.setMeta代替
        // $meta: function(obj, name) {
            // return Mayjs.meta.get(obj, name);
        // }
    };

    Mayjs.MFunction = Mayjs.$module({
        overload: function(fn, paramTypes){
            return Mayjs.$overload(paramTypes, fn);
        },
        paramNames: function(fn){
           return  Mayjs.util.parseParamNames(fn);
        },
        methodize: util.methodize
    });

    Mayjs.MObject = Mayjs.$module({
        trace: util.trace,
        clone: util.clone,
        merge: util.merge,
        mix: util.mix,
        dsl: Mayjs.$dsl,
        meta: Mayjs.meta.get,
        setMeta: Mayjs.meta.set,
        hasMeta: Mayjs.meta.has,
        support: function(obj, interface_){
            return Mayjs.$support(interface_, obj);
        },
        implement: function(obj, interface_){
            return Mayjs.$implement(interface_, obj);
        },
        is: function(obj, type){
            return Mayjs.$is(type, obj);
        },
        include: function(obj, module, option){
            return Mayjs.$include(module, obj, option);
        }
    });


    var utilExcludes = ["parseParamNames", "toObject", "clone", "overload", "parseArray", "trace",  "methodize", "mix", "merge"];
    Object.keys(util).forEach(function(name) {
        if(utilExcludes.indexOf(name) == -1)
            dsl["$" + name] = util[name];
    });

    var MayjsExcludes = ["$dsl", "$support","$is", "$extend", "$implement", "$include", "$overload"];
    Object.keys(Mayjs).forEach(function(name) {
        if(/^\$/.test(name)){
            if(MayjsExcludes.indexOf(name) == -1)
                dsl[name] = Mayjs[name];
        }
    });

    Mayjs.init = function(option){
        option = Mayjs.util.merge({
            "injectPrototype": true
        }, option);

        if(option.injectPrototype){
            Mayjs.$include(Mayjs.MObject, Object.prototype, {"methodize": true});
            Object.keys(Mayjs.MObject).forEach(function(k){
                HOST[k] = undefined;
            });
            Mayjs.$include(Mayjs.MFunction, Function.prototype, {"methodize": true});
        }else{
            Mayjs.$.regist(Object, Mayjs.MObject, {methodize: true});
            Mayjs.$.regist(Function, Mayjs.MFunction, {methodize: true});
        }
    };

    return dsl;
}, Mayjs, this);

Mayjs.DSL = Mayjs.$dsl(Mayjs.dsl);

