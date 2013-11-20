M.MObjectWrapper = {
    set: function(o, name, value) {
        o[name] = value;
        return o;
    },
    get: function(o, name) {
        return o[name];
    },
    call: function(o, fn) {
        fn = o[fn];
        var args = util.parseArray(arguments).split(2);
        return fn.apply(o, args);
    }
};
  