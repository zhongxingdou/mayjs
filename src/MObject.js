M.util.run(function() {
    var Tap = function(lastResult) {
        this.valueOf = function(){
            return lastResult;
        }
    }
    Tap.prototype.tap = function(fn) {
        return new Tap(fn(this.valueOf()));
    }

    M.MObjectWrapper = {
        tap: function(fn){
            return new Tap(fn(this.valueOf()));
        },
        mix: function(src, whitelist){
            M.$mix(this.valueOf(), src, whitelist);
            return this;
        },
        include: function(module, option){
            M.$include(this.valueOf(), option);
            return this;
        },
        has: function(prop){
            return M.MObjectUtil.has(this.valueOf(), prop);
        },
        can: function(methodName){
            return M.MObjectUtil.can(this.valueOf(), methodName);
        },
        eachProp: function(fn){
            M.MObjectUtil.eachProp(this.valueOf(), fn);
            return this;
        },
        __option__: {
            supports: [Object]
        }
    }
})