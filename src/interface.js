/**
 * interface 
 */

M.util.run(function(M){
    var Interface = {};

    var _getType = function(obj){
        return Object.prototype.toString.call(obj);
    }

    /* validate types = [null, undefined, "undefined",
            "number", "string", "boolean", "function", 
            Number, String, Boolean, Function];
    */
    var _isValueType = M.util.makeMultiTargetFn(function(type, obj){
        if(type == null || type == "undefined")return obj == null;

        var objType = _getType(obj)
        if(type == "number" || type == Number){
            return objType == _getType(Number.prototype);
        }else if(type == "string" || type == String){
            return objType == _getType(String.prototype);
        }else if(type == "boolean" || type == Boolean){
            return objType == _getType(Boolean.prototype);
        }else if(type == "function" || type == Function){
            return typeof(obj)== "function";
        }else{
            return false;
        }
    });

    var _isInstanceof = M.util.makeMultiTargetFn(function(Clazz, obj){
        if(typeof Clazz != "function")return false;

        if([Array, RegExp, Error, Date].indexOf(Clazz) != -1){
            return _getType(Clazz.prototype) === _getType(obj);
        }

        return obj instanceof Clazz;
    });

    var $is = M.util.makeMultiTargetFn(function(type, obj){
        if(_isValueType(type, obj))return true;
        if(_isInstanceof(type, obj))return true;
        return false;
    });

    var $hasProto = M.util.makeMultiTargetFn(function(proto, obj){
        if(typeof proto != "object")return false;
        if(proto == null)return false;
        return proto.isPrototypeOf(obj);
    });

    var $check = M.util.makeMultiTargetFn(function(result){
        if(result === false){
            throw "$check failed!";
        }
    });

    function _parseArguTypes(arguTypes, arguNames) {
        var meta = [];
        if(_is(Array, arguTypes)) {
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
                        if(arguName != "returns"){
                            meta.push({"name": arguName, "type": item[arguName] });
                        }
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
        fn.__argu_types__ = _parseArguTypes(arguTypes, M.util.parseArguNames(fn));
        return fn;
    }


    /**
     * 创建Interface的快捷方法
     * @memberof M
     * @param  {Object} define interface define
     * @param  {Interface} base base interface
     * @return {Interface}
     */
    function $interface(define, base) {
        if(base) {
            interface_ = Object.create(base);
        } else {
            interface_ = Object.create(Interface);
        }

        for(var p in define){
            interface_[p] = define[p];
        }

        return interface_;
    }

    function _is(type, obj){
        if($is(type, obj) || $hasProto(type, obj)){
            return true;
        }

        var t = typeof(type);
        if(t == "function"){
            if(type.prototype && $hasProto(type.prototype, obj))return true;
        }else if(t == "object"){
            return $support(type, obj);
        }

        return false;
    }


    /**
     * 判断一个对象是否支持指定协议
     * @memberof M
     * @param {Interface} interface_
     * @param {Object} o
     * @param {bool} exactly=false
     * @return {Boolean}
     */

    function $support(interface_, obj, exactly) {
        //非严格格式下，如果对象的已实现接口中包含了该接口，则认为支持该接口。否则通过检查来确定是否支持。
        if(!exactly && obj.__interfaces__ && obj.__interfaces__.indexOf(interface_) != -1) {
            return true;
        }

        var isOptionalName = /^\[(.*?)\]$/;
        var isMataName = /^__.*__$/;
        for(var name in interface_) {
            var member = obj[name];
            var type = interface_[name];

            var optionalName = name.match(isOptionalName);
            if(optionalName){
                name = optionalName[1];
                member = obj[name]; 
                if(member == null)continue;  //可选参数为null或者undefined则表示没有出现，不用检查
            }

            if(isMataName.test(name))continue;

            if($is(Array, type)){ //用数组实例表示方法签名，如[TypeOfP1, TypeOfP2]，要表示成员类型是数组，用Array类
                if(!typeof(member) == "function")return false;
                continue;  
            }else if(!_is(type, member)){
                return false;
            } 
      }
        return true;
    }

    /**
     * implement a interface
     * @memberof M
     * @param {Interface} interface_
     * @param {Object} obj
     */
    function $implement(interface_, obj) {
        var interfaces = obj.__interfaces__ || (obj.__interfaces__ = []);
        if(interfaces.indexOf(interface_) == -1) {
            if(!$support(interface_, obj)) {
                throw "object did not implement given interface";
            }

            //write arguments meta to methods of obj
            Object.keys(interface_).forEach(function(p) {
                if(_is(Array, interface_[p])) { //接口声明用Array来表示方法签名
                    obj[p].__argu_types__ = _parseArguTypes(interface_[p]);
                }
            });

            interfaces.push(interface_);
        }
    }

    M.Interface = Interface;

    M.$interface = $interface;
    M.$support = $support;
    M.$implement = $implement;
    M.$is = $is;
    M.$hasProto = $hasProto;
    M.$func = $func;
    M.$check = $check;
    M._is = _is;
}, M);
