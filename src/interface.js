/**
 * @require M.util
 * @require Maysj.meta
 * @require M.MObjectUtil
 */

Mayjs.$run(function(M) {
    var meta = M.meta;
    
    var parseArray = M.util.parseArray;
    var parseParamNames = M.util.parseParamNames;

    var eachOwn = M.MObjectUtil.eachOwn;
    var mix = M.MObjectUtil.mix;

    var Interface = {};

    function _parseParamTypes(paramTypes, paramNames) {
        var meta = [];
        if($is(Array, paramTypes)) {
            if(paramNames) { //$def声明时带了方法定义，参数类型声明中无参数名项，参数名列表从方法定义中获取
                for(var i = 0, l=paramNames.length; i < l; i++) {
                    meta.push({
                        "name": paramNames[i],
                        "type": paramTypes[i]
                    });
                }
            } else { //在$interface中声明成员方法的参数类型时，需要指定对映参数名，故无须提供参数名列表
                paramTypes.forEach(function(item){
                    eachOwn(item, function(paramName, paramType){
                        meta.push({"name": paramName, "type": paramType });
                        return false;
                    });
                });
            }
        } else { //在$def中定义的option,即$def({param1: Type1, param2: Type2}, function(param1, param2){});
            meta.push({
                "name": paramNames[0],
                "type": $interface(paramTypes)
            });
        }
        return meta;
    }

    function $def(paramTypes, fn) {
        meta.set(fn, "param_types", _parseParamTypes(paramTypes, parseParamNames(fn)));
        return fn;
    }


    /**
     * 创建Interface的快捷方法
     * @memberof M
     * @param  {Object} define interface define
     * @param  {Interface} base base interface
     * @return {Interface}
     */

    function $interface (define, base) {
        if(base) {
            // if(!Interface.isPrototypeOf(base)) throw "Parameter base is not an Interface";
            interface_ = Object.create(base);
        } else {
            interface_ = Object.create(Interface);
        }
        mix(interface_, define);
        return interface_;
    }

    /**
     * 对象类型判断
     * @memberof M
     * @param  {Object|String}  type
     * @param  {Object}  o
     * @return {Boolean}
     */

    function $is(type, o) {
        if(type === null) return o === null;
        if(type === undefined) return o === undefined;

        var result = false;
        switch(typeof type) {
        case "string":
            result = typeof(o) == type;
            break;
        case "object":
            if(Interface.isPrototypeOf(type)) {
                result = $support(type, o);
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
    }

    /**
     * 判断一个对象是否支持指定协议
     * @memberof M
     * @param  {Interface} interface_
     * @param  {Object} o
     * @return {Boolean}
     */

    function $support(interface_, o) {
        if(meta.has(o, "interfaces") && meta.get(o, "interfaces").indexOf(interface_) != -1) {
            return true;
        }

        for(var k in interface_) {
            if(/^__.*__$/.test(k))continue;
            
            if($is(Array, interface_[k])) {
                if(!$is("function", o[k])) {
                    return false;
                }
            } else {
                if(!$is(interface_[k], o[k])) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * implement a interface
     * @memberof M
     * @param  {Interface} interface_
     * @param  {Object} obj
     */

    function $implement(interface_, obj) {
        if(!meta.has(obj, "interfaces")) {
            meta.set(obj, "interfaces", []);
        }

        var interfaces = meta.get(obj, "interfaces");
        if(interfaces.indexOf(interface_) == -1) {
            if(!$support(interface_, obj)) {
                throw "not supported interface";
            }

            //write arguments meta for methods of obj
            Object.keys(interface_).forEach(function(p) {
                if($is(Array, interface_[p])) {
                    meta.set(obj[p], "param_types", _parseParamTypes(interface_[p]));
                }
            });

            interfaces.push(interface_);
        }
    }

    function $check() {
        var caller = arguments.callee.caller;
        var args = caller["arguments"];
        var paramTypes;
        if(arguments.length === 0) {
            paramTypes = meta.get(caller, "param_types");
        } else {
            paramTypes = _parseParamTypes(parseArray(arguments), parseParamNames(caller));
        }
        var type;
        for(var i = 0, l = args.length; i < l; i++) {
            type = paramTypes[i].type;
            //将方法的参数声明为null类型，表明其可为任何值，所以总是验证通过
            if(type === null) return true;
            if(!$is(type, args[i])) {
                return false;
            }
        }
        return true;
    }

    M.$interface = $interface;
    M.$implement = $implement;
    M.$support = $support;
    M.$is = $is;
    M.$check = $check;
    M.$def = $def;
    M.Interface = Interface;
}, Mayjs);