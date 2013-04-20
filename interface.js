/**
 * interface prototype
 * @memberof Mayjs
 * @type {Object}
 */

Mayjs.Interface = {};

Mayjs.interface_ = {
    _parseArgsMeta: function(argsDefine, paramNames) {
        var meta = [];
        if(Mayjs.interface_.is(Array, argsDefine)) { //在$interface中声明成员方法的参数类型时，总是使用数组
            var l = argsDefine.length;
            var i;
            if(paramNames) { //$def声明时带了方法定义，参数类型声明中无参数名项，参数名列表从方法定义中获取
                for(i = 0; i < l; i++) {
                    meta.push({
                        "name": paramNames[i],
                        "type": argsDefine[i]
                    });
                }
            } else { //在$interface中声明成员方法的参数类型时，需要指定对映参数名，故无须提供参数名列表
                for(i = 0; i < l; i += 2) {
                    meta.push({
                        "name": argsDefine[i],
                        "type": argsDefine[i + 1]
                    });
                }
            }
        } else { //在$def中定义的option,即$def({param1: Type1, param2: Type2}, function(param1, param2){});
            meta.push({
                "name": paramNames[0],
                "type": Mayjs.interface_.create(argsDefine)
            });
        }
        return meta;
    },

    def: function(argsDefine, fn) {
        Mayjs.meta.set(fn, "paramspec", Mayjs.interface_._parseArgsMeta(argsDefine, Mayjs.util.parseParamNames(fn)));
        return fn;
    },


    /**
     * 创建Interface的快捷方法
     * @memberof Mayjs
     * @param  {Object} define interface define
     * @param  {Interface} base base interface
     * @return {Interface}
     */

    create: function(define, base) {
        var interface_;
        if(base) {
            if(!Mayjs.Interface.isPrototypeOf(base)) throw "Parameter base is not an Interface";
            interface_ = Object.create(base);
        } else {
            interface_ = Object.create(Mayjs.Interface);
        }
        Mayjs.util.mix(define, interface_);
        return interface_;
    },

    /**
     * 对象类型判断
     * @memberof Mayjs
     * @param  {Object|String}  type
     * @param  {Object}  o
     * @return {Boolean}
     */

    is: function(type, o) {
        if(type === null) return o === null;
        var result = false;
        switch(typeof type) {
        case "string":
            result = typeof(o) == type;
            break;
        case "object":
            if(Mayjs.Interface.isPrototypeOf(type)) {
                result = Mayjs.interface_.support(type, o);
            } else {
                result = type.isPrototypeOf(o);
            }
            break;
        case "function":
            var proto = type.prototype;
            if(proto) {
                result = proto.isPrototypeOf(o);
            } else {
                result = o instanceof type;
            }
            break;
        }
        return result;
    },

    /**
     * 判断一个对象是否支持指定协议
     * @memberof Mayjs
     * @param  {Interface} interface_
     * @param  {Object} o
     * @return {Boolean}
     */

    support: function(interface_, o) {
        if(Mayjs.meta.has(o, "interfaces") && Mayjs.meta.get(o, "interfaces").indexOf(interface_) != -1) {
            return true;
        }

        var is = Mayjs.interface_.is;

        for(var k in interface_) {
            if(is(Array, interface_[k])) {
                if(!is("function", o[k])) {
                    return false;
                }
            } else {
                if(!is(interface_[k], o[k])) {
                    return false;
                }
            }
        }
        return true;
    },
    /**
     * implement a interface
     * @memberof Mayjs
     * @param  {Interface} interface_
     * @param  {Object} obj
     */

    implement: function(interface_, obj) {
        var self = Mayjs.interface_;
        var meta = Mayjs.meta;
        if(!meta.has(obj, "interfaces")) {
            meta.set(obj, "interfaces", []);
        }

        var interfaces = meta.get(obj, "interfaces");
        if(interfaces.indexOf(interface_) == -1) {
            if(!self.support(interface_, obj)) {
                throw "Not support interface_";
            }

            //write arguments meta for methods of obj
            Object.keys(interface_).forEach(function(p) {
                if(self.is(Array, interface_[p])) {
                    meta.set(obj[p], "paramspec", self._parseArgsMeta(interface_[p]));
                }
            });

            interfaces.push(interface_);
        }
    },

    checkParams: function(fn, args) {
        var caller = fn || arguments.callee.caller;
        args = args || caller["arguments"];
        var paramsMeta = Mayjs.meta.get(fn, "paramspec");
        var type;
        for(var i = 0, l = args.length; i < l; i++) {
            type = paramsMeta[i].type;
            //将方法的参数声明为null类型，表明其可为任何值，所以总是验证通过
            if(type === null) return true;
            if(!Mayjs.interface_.is(type, args[i])) {
                return false;
            }
        }
        return true;
    }
};