/**
 * interface 
 */

Mayjs.util.run(function(M){
    var Interface = {};

    /**
     * 对象类型判断
     * @memberof M
     * @argu  {Object|String}  type
     * @argu  {Object}  o
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
            } else { //先看它是不是原型，如果不是，则假定它为接口声明，但并不是接口对象的实例
                result = type.isPrototypeOf(o);
                if(!result){
                    result = $support(type, o);
                }
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

    function parseArguNames(fn) {
        var m = fn.toString().match(/.*?\((.*)?\)/);
        if(m && m[1]) {
            return m[1].split(",").map(function(i){ return i.trim();});
        }
        return [];
    }

    function _parseArguTypes(arguTypes, arguNames) {
        var meta = [];
        if($is(Array, arguTypes)) {
            if(arguNames) { //$func声明时带了方法定义，参数类型声明中无参数名项，参数名列表从方法定义中获取
                for(var i = 0, l=arguNames.length; i < l; i++) {
                    meta.push({
                        "name": arguNames[i],
                        "type": arguTypes[i]
                    });
                }
            } else { //在$interface中声明成员方法的参数类型时，需要指定对映参数名，故无须提供参数名列表
                arguTypes.forEach(function(item){
                    for(var arguName in item){
                        var arguType = item[arguType];
                        meta.push({"name": arguName, "type": arguType });
                        break;
                    }
                });
            }
        } else { //在$func中定义的option,即$func({argu1: Type1, argu2: Type2}, function(argu1, argu2){});
            meta.push({
                "name": arguNames[0],
                "type": $interface(arguTypes)
            });
        }
        return meta;
    }

    function $func(arguTypes, fn) {
        fn.__argu_types__ = _parseArguTypes(arguTypes, parseArguNames(fn));
        return fn;
    }


    /**
     * 创建Interface的快捷方法
     * @memberof M
     * @argu  {Object} define interface define
     * @argu  {Interface} base base interface
     * @return {Interface}
     */

    function $interface (define, base) {
        if(base) {
            // if(!Interface.isPrototypeOf(base)) throw "Parameter base is not an Interface";
            interface_ = Object.create(base);
        } else {
            interface_ = Object.create(Interface);
        }

        for(var p in define){
            interface_[p] = define[p];
        }

        return interface_;
    }

    /**
     * 判断一个对象是否支持指定协议
     * @memberof M
     * @argu  {Interface} interface_
     * @argu  {Object} o
     * @return {Boolean}
     */

    function $support(interface_, o) {
        if(o.__interfaces__ && o.__interfaces__.indexOf(interface_) != -1) {
            return true;
        }

        for(var k in interface_) {
            //ignore meta member that likes __proto__
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
     * @argu  {Interface} interface_
     * @argu  {Object} obj
     */

    function $implement(obj, interface_) {
        var interfaces = obj.__interfaces__ || (obj.__interfaces__ = []);
        if(interfaces.indexOf(interface_) == -1) {
            if(!$support(interface_, obj)) {
                throw "interface not supported";
            }

            //write arguments meta for methods of obj
            Object.keys(interface_).forEach(function(p) {
                if($is(Array, interface_[p])) {
                    obj[p].__argu_types__ = _parseArguTypes(interface_[p]);
                }
            });

            interfaces.push(interface_);
        }
    }

    function $checkArgu() {
        var caller = arguments.callee.caller;
        var args = caller["arguments"];
        var arguTypes;
        if(arguments.length === 0) {
            arguTypes = caller.__argu_types__;
        } else {
            arguTypes = _parseArguTypes(Array.prototype.slice.call(arguments), parseArguNames(caller));
        }
        var type;

        for(var i = 0, l = arguTypes.length; i < l; i++) {
            type = arguTypes[i].type;
            //将方法的参数声明为undefined类型，表明其可为任何值，所以总是验证通过
            if(type === undefined) return true;
            if(!$is(type, args[i])) {
                return false;
            }
        }
        return true;
    }

    M.parseArguNames = parseArguNames;
    M.Interface = Interface;

    M.$interface = $interface;
    M.$support = $support;
    M.$implement = $implement;
    M.$is = $is;
    M.$checkArgu = $checkArgu;
    M.$func = $func;
}, Mayjs);
