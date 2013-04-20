/**
 * [base description]
 * @require Mayjs.meta
 * @require Mayjs.util
 * @require Mayjs.core
 * @require Mayjs.interface
 * @type {Object}
 */

/**
 * @memberof Mayjs
 * @type {Interface}
 */
Mayjs.IBase = Mayjs.interface_.create({
    "initialize": [],
    "include": ["module:", Object, "[includeOption]:", Object],
    /*
    "method": [{
        "opt1": [Object, Array],
        "opt2": Object,
        "opt3": Object
    }],*/
    "implement": ["interface:", Mayjs.interface_.Interface],
    "__interfaces__": Array
});

/**
 * @lends Mayjs.Base.prototype
 */
Mayjs.Base = Mayjs.core.extend(Object.prototype, {
    "@statics": {
        "extend": function(config) {
            if(!config.initialize) {
                config.initialize = function() {
                    this.base();
                };
            }
            return Mayjs.core.extend(this.prototype, config);
        }
    },
    /**
     * initialize instance of this prototype <br>
     * 使用Mayjs.Base.create()或Mayjs.$obj()来创建实例，
     * @constructs
     * @see Mayjs.$obj
     */
    "initialize": function() {
        Mayjs.meta.set(this, "interfaces", []);
    },
    _callerOwner: function(caller) {
        var callerOwner = null;
        Mayjs.util.trace(this, "__proto__", function(proto) {
            Object.keys(proto).forEach(function(p) {
                if(proto[p] == caller) {
                    callerOwner = proto;
                    caller["@name"] = p;
                    return false;
                }
            });
            if(callerOwner) return false;
        });
        return callerOwner;
    },

    //返回此方法的调用者的拥有者(prototype)
    //此方法不可像this.proto().proto()这样用，请像this.proto().__proto__
    /**
     * get member from base prototype
     * @param  {String} member member name
     * @return {Object}
     */
    protoMember: function(member) {
        var callerOwner = this._callerOwner(arguments.callee.caller);
        if(callerOwner) {
            var ptoto;
            if((proto = Mayjs.meta.get(callerOwner, "proto"))) {
                return proto[member];
            }
        }
    },
    /**
     * 类似C#的base()和Java的super()，获取调用此方法的方法名，在对象的base prototype中调用这个方法
     * @return {Object}
     */
    base: function() {
        var caller = arguments.callee.caller;
        var callerOwner = this._callerOwner(caller);

        var callerName = caller["@name"];
        delete caller["@name"];

        var base = callerOwner ? Mayjs.meta.get(callerOwner, "proto") : null;
        var fn = base ? base[callerName] : null;

        if(typeof fn == "function") {
            return fn.apply(this, arguments);
        }
    },
    /**
     * include a module
     * @param  {Object} module
     * @param  {Object} [option]
     * @return {Object} this
     */
    include: function(module, option) {
        Mayjs.module.include(module, this, option);
        return this;
    },
    /**
     * implement a interface_
     * @param  {Interface} interface_
     * @return {Object} this
     */
    implement: function(interface_) {
        Mayjs.interface_.implement(interface_, this);
        return this;
    },
    /**
     * 判断对象是否支持指定协议
     * @param  {Protocl} interface_
     * @return {Boolean}
     */
    supported: function(interface_) {
        return this.meta("interfaces").indexOf(interface_) != -1;
    },
    /**
     * 获取对象的meta值
     * @param  {String} name
     * @return {Object}
     */
    meta: function(name) {
        return Mayjs.meta.get(this, name);
    },
    /**
     * dsl
     * @function
     * @see Mayjs.$dsl
     */
    dsl: Mayjs.core.dsl
});

Mayjs.Base.implement(Mayjs.IBase);

