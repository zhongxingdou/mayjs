(function(HOST) { /** @namespace Mayjs  */
    Mayjs.dsl = function(){
        return Mayjs.core.dsl.call(Mayjs.dsl);
    };

    var _dsl = {};

    /**
     * 创建Base的便捷方法
     * @memberof Mayjs
     * @param  {Object} a
     * @return {Base}
     */
    _dsl.obj = function(a) {
        var o = new this.Base();
        Mayjs.util.mix(a, o);
        return o;
    };

    _dsl.meta = function(obj, name){
        return Mayjs.meta.get(obj, name);
    };

    _dsl.global = Mayjs.global;

    var mix = Mayjs.util.mix;
    mix(Mayjs.util, _dsl, ["parseParamNames"]);
    mix(Mayjs.core, _dsl);

    mix(Mayjs.module, _dsl,["create"]);
    _dsl.module = Mayjs.module.create;

    mix(Mayjs.interface_, _dsl, ["create", "_parseArgsMeta"]);
    _dsl["interface"] = function(o, base){
        return Mayjs.interface_.create(o, base);
    };

    mix(Mayjs.overload, _dsl);

    var dsl = Mayjs.dsl;
    Object.keys(_dsl).forEach(function(name){
        dsl["$"+name] = _dsl[name];
    });
    dsl.$ = Mayjs.$;
    dsl.$$ = Mayjs.$$;

    Mayjs.global("$run", Mayjs.util.run);
})(this);