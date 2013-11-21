var Mayjs={
    version: 0.1
}
if(typeof(module) != "undefined")module.exports = Mayjs;
Mayjs.util = {
    /**
     * 将一个值对象转换成引用对象
     * @memberof Mayjs
     * @param {Object} value
     * @return {Object}
     */
    toObject: function(value) {
        var obj = value;
        switch(typeof value){
            case 'string':
                obj = new String(value);
                break;
            case 'number':
                obj = new Number(value);
                break;
            case 'boolean':
                obj = new Boolean(value);
                break;
        }
        return obj;
    },

    /**
     * 调用方法自身
     * @memberof Mayjs
     * @return {Function}
     */

    fn: function() {
        return arguments.callee.caller.apply(this, arguments);
    },

    /**
     * 将类Array对象转换成Array
     * @memberof Mayjs
     * @param  {Object} arrayLikeObj
     * @return {Array}
     */

    parseArray: function(arrayLikeObj) {
        return Array.prototype.slice.call(arrayLikeObj, 0);
    },


    /**
     * 声明一个枚举
     * @memberof Mayjs
     * @param {...String} names enumeration key
     * @example
     * var color = $enum("BLUE", "RED", "YELLOW");
     * color.BLUE
     * color.RED
     * color.YELLOW
     *
     * var color = $enum{{
     *  "BLUE": -1,
     *  "RED": 1
     * })
     */

    enumeration: function(names) {
        if(typeof names == "object") {
            return arguments[0];
        }

        var _enum = {};
        for(var i = 0, l = arguments.length; i < l; i++) {
            _enum[arguments[i]] = {};
        }

        return _enum;
    },


    /**
     * 将一个纯函数包装成指定对象的一个方法，并在此时设定纯函数的第一参数
     * @memberof Mayjs
     * @param  {Function} fn 纯函数
     * @param  {Object}   [firstParam=this] fn的第一个参数，如果没有getFirstParam的话
     * @param  {Function} [getFirstParam] 使用此函数获取fn的第一个参数，调用此函数时将把firstParam传递给它
     * @return {Function}
     */

    methodize: function(fn, firstParam, getFirstParam) {
        var slice = Array.prototype.slice;
        return function() {
            var obj = firstParam || this;
            var args = [getFirstParam ? getFirstParam(obj) : obj].concat(slice.call(arguments, 0));
            return fn.apply(null, args);
        };
    },

    /**
     * overwrite对象的方法，新方法将调用指定的overwriter并把原方法当作第一个参数传递给它
     * @param  {Object} obj 被覆盖的对象
     * @param  {string} funcName   对象被覆盖的方法名
     * @param  {Function} overwriter 实际替代原方法的函数
     */
    overwrite: function(obj, funcName, overwriter) {
        var _baseFn = obj[funcName].bind(obj);
        obj[funcName] = function() {
            var args = [_baseFn].concat(Array.prototype.slice.call(arguments, 0));
            return overwriter.apply(obj, args);
        };
    },


    /**
     * 生成供eval()函数将指定变量成员声明为当前作用域内变量的代码
     * 导入后会导致对象的方法调用时this变化
     * @memberof Mayjs
     * @param  {String} [obj=this]
     * @return {String}
     * @example
     * var Calculator = {
     *     add: function(a, b){ return a + b },
     *     sub: function(a, b){ return a - b }
     * }
     *
     * eval(localize(Calculator));
     *
     * add(4, 6);
     * sub(10, 4);
     */

    localize: function(obj, names) {
        obj = obj || this;

        //create global tempObj
        var tempVarName = "_temp" + Date.now();
        eval(tempVarName + "={value: {}}");

        //get tempObj and set it's value with obj
        var temp = eval(tempVarName);
        temp.value = obj;

        if(typeof names == "string" && names !== ""){
            names = names.split(" ").map(function(n){ return n.trim(); });
        }else if(!names){
            names = Object.keys(obj);
        }

        //generate members declare string
        // var keys = Object.keys(obj).filter(function(k) {
            // return obj.hasOwnProperty(k) && typeof obj[k] == "function";
        // });

        var members = names.map(function(name) {
            return name + "=" + tempVarName + ".value" + "['" + name + "']";
        });
        return "var " + members.join(",") + "; delete " + tempVarName;
    },

    /**
     * 运行一个方法，一个快捷的使用闭包来避免全局变量的方法
     * @param  {Function} fn [description]
     * @return {[type]}      [description]
     */
    run: function(fn) {
        if(arguments.length == 1) {
            return fn();
        } else {
            return fn.apply(this, Array.prototype.slice.call(arguments, 1));
        }
    }
}

Mayjs.MObjectUtil = {
    isPrivate: function(name) {
        return(/^__/).test(name);
    },

    isProtected: function(name) {
        return(/^_(?!_)/).test(name);
    },

    isPublic: function(name) {
        return !this.isProtected(name) && !this.isPrivate(name);
    },

    have: function(o, property) {
        return(o && o.hasOwnProperty(property) && typeof o[property] != "function") || false;
    },

    can: function(o, fn) {
        return(o && o[fn] && typeof o[fn] == "function") || false;
    },

    eachAll: function(o, fn) {
        for(var p in o) {
            if(fn(p, o[p]) === false) break;
        }
    },

    eachOwn: function(o, fn) {
        for(var p in o) {
            if(o.hasOwnProperty(p) && this.isPublic(p)) {
                if(fn(p, o[p]) === false) break;
            }
        }
    },

    eachProp: function(o, fn) {
        this.eachOwn(o, function(p, op) {
            if(typeof op != "function") {
                return fn(p, op);
            }
        });
    },

    /**
     * 根据指定属性来追溯
     * @memberof Mayjs
     * @param {Object} o 对象
     * @param {String} prop 属性名
     * @param {Function} fn(a) 处理函数(追溯到的对象)
     * @return Boolean 全部处理完则返回true，中途结果返回false
     */

    traverseChain: function(o, prop, fn) {
        var v = o[prop];
        while(v) {
            if(fn(v) === false) return false;
            v = v[prop];
        }
        return true;
    },

    /**
     * clone oect
     * @memberof Mayjs
     * @param  {Object} o 被克隆的对象
     * @param  {Boolean} [deep=false] 是否深度克隆
     * @return {Object} o的克隆
     */

    clone: function(o, deep) {
        if(!o) return o;

        if(['object', 'function'].indexOf(typeof(o)) == -1) { //value type
            return o;
        }

        if(typeof o.clone == "function") {
            return o.clone(deep);
        }

        var cloneObj = {};
        var className = Object.prototype.toString.call(o).slice(8, -1);
        if(className === 'Array') {
            cloneObj = [];
            if(deep) {
                for(var i = 0, l = o.length; i < l; i++) {
                    cloneObj.push(arguments.callee(o[i], deep));
                }
            } else {
                cloneObj = o.slice(0);
            }
        } else if(className !== 'Object') {
            cloneObj = new o.constructor(o.valueOf());
        }

        if(deep) {
            for(var p in o) {
                var op = o[p];
                if(Object.prototype.isPrototypeOf(op)) {
                    cloneObj[p] = arguments.callee(op, deep);
                } else {
                    cloneObj[p] = op;
                }
            }
        } else {
            for(var p in o) {
                cloneObj[p] = o[p];
            }
        }
        return cloneObj;
    },

    /**
     * copy members from src to o
     * @memberof Mayjs
     * @param  {Object} o [description]
     * @param  {Object} src [description]
     * @param  {String[]} [whitelist=null] 不想被覆盖的成员
     * @return {Object}
     */
    mix: function(o, src, whitelist) {
        if(!src) return o;
        var p;
        if(whitelist) {
            for(p in src) {
                if(whitelist.indexOf(p) == -1) {
                    o[p] = src[p];
                }
            }
        } else {
            for(p in src) {
                o[p] = src[p];
            }
        }
        return o;
    },

    /**
     * merge o to a to b ... n
     * @memberof Mayjs
     * @param {Object} o
     * @param {Object} a
     * @return {Object} merge result
     */
    merge: function(o, a /*,b,c,...n*/ ) {
        var obj = {},
            curr = null,
            p;

        for(var i = 0, l = arguments.length; i < l; i++) {
            curr = arguments[i];
            if(!curr) continue;
            for(p in curr) {
                obj[p] = curr[p];
            }
        }

        return obj;
    }
}
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

    function $implement(interface_, obj) {
        var interfaces = obj.__interfaces__ || obj.__interfaces__ = [];
        if(interfaces.indexOf(interface_) == -1) {
            if(!$support(interface_, obj)) {
                throw "not supported interface";
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
        for(var i = 0, l = args.length; i < l; i++) {
            type = arguTypes[i].type;
            //将方法的参数声明为null类型，表明其可为任何值，所以总是验证通过
            if(type === null) return true;
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
