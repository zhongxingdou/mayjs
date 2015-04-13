/**
* 执行fn并把一个新的Wrapper的$()和$$()传递给它
* 如果没有传递任何参数，则执行{@link M.exportDSL}
* @namespace {Function} M
* @param {Function} [fn] 
*/
var M=function(fn){
	if(arguments.length == 0){
		return M.exportDSL();
	}else if(fn){
		var wrapper = M.$wrapper();
		var args = Array.prototype.slice.call(arguments, 1);
		return fn.apply(this, [wrapper.$, wrapper.$$].concat(args));
	}
}

/**
* 引用当前运行环境的全局对象
* 浏览器中指向window，node环境下指向global
*/
M.global = this;
if(typeof global != "undefined")M.global = global;

/**
* 将May.js的关键字方法复制到目标对象
* 如果未传递target参数，则使用eval()导出到当前作用域内
* @param {Object} [target] 目标对象
*/
M.exportDSL = function(target) {
    var _getKeywordFunc = function(){
        return Object.keys(M).filter(function(name){
            return (/^\$/).test(name) && ["$", "$$"].indexOf(name) == -1;
        });
    }

    if(target){
        _getKeywordFunc().forEach(function (prop) {
            target[prop] = M[prop];
        });
    }else{
        return M.util.dsl(M, _getKeywordFunc()) + M.util.dsl(M.$wrapper());
    }
}

if(typeof(module) != "undefined")module.exports = M;

/*
 * JavaScript MD5 1.0.1
 * https://github.com/blueimp/JavaScript-MD5
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 * 
 * Based on
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

/*jslint bitwise: true */
/*global unescape, define */

(function ($) {
    'use strict';

    /*
    * Add integers, wrapping at 2^32. This uses 16-bit operations internally
    * to work around bugs in some JS interpreters.
    */
    function safe_add(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF),
            msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }

    /*
    * Bitwise rotate a 32-bit number to the left.
    */
    function bit_rol(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    }

    /*
    * These functions implement the four basic operations the algorithm uses.
    */
    function md5_cmn(q, a, b, x, s, t) {
        return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
    }
    function md5_ff(a, b, c, d, x, s, t) {
        return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }
    function md5_gg(a, b, c, d, x, s, t) {
        return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }
    function md5_hh(a, b, c, d, x, s, t) {
        return md5_cmn(b ^ c ^ d, a, b, x, s, t);
    }
    function md5_ii(a, b, c, d, x, s, t) {
        return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    /*
    * Calculate the MD5 of an array of little-endian words, and a bit length.
    */
    function binl_md5(x, len) {
        /* append padding */
        x[len >> 5] |= 0x80 << (len % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;

        var i, olda, oldb, oldc, oldd,
            a =  1732584193,
            b = -271733879,
            c = -1732584194,
            d =  271733878;

        for (i = 0; i < x.length; i += 16) {
            olda = a;
            oldb = b;
            oldc = c;
            oldd = d;

            a = md5_ff(a, b, c, d, x[i],       7, -680876936);
            d = md5_ff(d, a, b, c, x[i +  1], 12, -389564586);
            c = md5_ff(c, d, a, b, x[i +  2], 17,  606105819);
            b = md5_ff(b, c, d, a, x[i +  3], 22, -1044525330);
            a = md5_ff(a, b, c, d, x[i +  4],  7, -176418897);
            d = md5_ff(d, a, b, c, x[i +  5], 12,  1200080426);
            c = md5_ff(c, d, a, b, x[i +  6], 17, -1473231341);
            b = md5_ff(b, c, d, a, x[i +  7], 22, -45705983);
            a = md5_ff(a, b, c, d, x[i +  8],  7,  1770035416);
            d = md5_ff(d, a, b, c, x[i +  9], 12, -1958414417);
            c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
            b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
            a = md5_ff(a, b, c, d, x[i + 12],  7,  1804603682);
            d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
            c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
            b = md5_ff(b, c, d, a, x[i + 15], 22,  1236535329);

            a = md5_gg(a, b, c, d, x[i +  1],  5, -165796510);
            d = md5_gg(d, a, b, c, x[i +  6],  9, -1069501632);
            c = md5_gg(c, d, a, b, x[i + 11], 14,  643717713);
            b = md5_gg(b, c, d, a, x[i],      20, -373897302);
            a = md5_gg(a, b, c, d, x[i +  5],  5, -701558691);
            d = md5_gg(d, a, b, c, x[i + 10],  9,  38016083);
            c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
            b = md5_gg(b, c, d, a, x[i +  4], 20, -405537848);
            a = md5_gg(a, b, c, d, x[i +  9],  5,  568446438);
            d = md5_gg(d, a, b, c, x[i + 14],  9, -1019803690);
            c = md5_gg(c, d, a, b, x[i +  3], 14, -187363961);
            b = md5_gg(b, c, d, a, x[i +  8], 20,  1163531501);
            a = md5_gg(a, b, c, d, x[i + 13],  5, -1444681467);
            d = md5_gg(d, a, b, c, x[i +  2],  9, -51403784);
            c = md5_gg(c, d, a, b, x[i +  7], 14,  1735328473);
            b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

            a = md5_hh(a, b, c, d, x[i +  5],  4, -378558);
            d = md5_hh(d, a, b, c, x[i +  8], 11, -2022574463);
            c = md5_hh(c, d, a, b, x[i + 11], 16,  1839030562);
            b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
            a = md5_hh(a, b, c, d, x[i +  1],  4, -1530992060);
            d = md5_hh(d, a, b, c, x[i +  4], 11,  1272893353);
            c = md5_hh(c, d, a, b, x[i +  7], 16, -155497632);
            b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
            a = md5_hh(a, b, c, d, x[i + 13],  4,  681279174);
            d = md5_hh(d, a, b, c, x[i],      11, -358537222);
            c = md5_hh(c, d, a, b, x[i +  3], 16, -722521979);
            b = md5_hh(b, c, d, a, x[i +  6], 23,  76029189);
            a = md5_hh(a, b, c, d, x[i +  9],  4, -640364487);
            d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
            c = md5_hh(c, d, a, b, x[i + 15], 16,  530742520);
            b = md5_hh(b, c, d, a, x[i +  2], 23, -995338651);

            a = md5_ii(a, b, c, d, x[i],       6, -198630844);
            d = md5_ii(d, a, b, c, x[i +  7], 10,  1126891415);
            c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
            b = md5_ii(b, c, d, a, x[i +  5], 21, -57434055);
            a = md5_ii(a, b, c, d, x[i + 12],  6,  1700485571);
            d = md5_ii(d, a, b, c, x[i +  3], 10, -1894986606);
            c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
            b = md5_ii(b, c, d, a, x[i +  1], 21, -2054922799);
            a = md5_ii(a, b, c, d, x[i +  8],  6,  1873313359);
            d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
            c = md5_ii(c, d, a, b, x[i +  6], 15, -1560198380);
            b = md5_ii(b, c, d, a, x[i + 13], 21,  1309151649);
            a = md5_ii(a, b, c, d, x[i +  4],  6, -145523070);
            d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
            c = md5_ii(c, d, a, b, x[i +  2], 15,  718787259);
            b = md5_ii(b, c, d, a, x[i +  9], 21, -343485551);

            a = safe_add(a, olda);
            b = safe_add(b, oldb);
            c = safe_add(c, oldc);
            d = safe_add(d, oldd);
        }
        return [a, b, c, d];
    }

    /*
    * Convert an array of little-endian words to a string
    */
    function binl2rstr(input) {
        var i,
            output = '';
        for (i = 0; i < input.length * 32; i += 8) {
            output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
        }
        return output;
    }

    /*
    * Convert a raw string to an array of little-endian words
    * Characters >255 have their high-byte silently ignored.
    */
    function rstr2binl(input) {
        var i,
            output = [];
        output[(input.length >> 2) - 1] = undefined;
        for (i = 0; i < output.length; i += 1) {
            output[i] = 0;
        }
        for (i = 0; i < input.length * 8; i += 8) {
            output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
        }
        return output;
    }

    /*
    * Calculate the MD5 of a raw string
    */
    function rstr_md5(s) {
        return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
    }

    /*
    * Calculate the HMAC-MD5, of a key and some data (raw strings)
    */
    function rstr_hmac_md5(key, data) {
        var i,
            bkey = rstr2binl(key),
            ipad = [],
            opad = [],
            hash;
        ipad[15] = opad[15] = undefined;
        if (bkey.length > 16) {
            bkey = binl_md5(bkey, key.length * 8);
        }
        for (i = 0; i < 16; i += 1) {
            ipad[i] = bkey[i] ^ 0x36363636;
            opad[i] = bkey[i] ^ 0x5C5C5C5C;
        }
        hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
        return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
    }

    /*
    * Convert a raw string to a hex string
    */
    function rstr2hex(input) {
        var hex_tab = '0123456789abcdef',
            output = '',
            x,
            i;
        for (i = 0; i < input.length; i += 1) {
            x = input.charCodeAt(i);
            output += hex_tab.charAt((x >>> 4) & 0x0F) +
                hex_tab.charAt(x & 0x0F);
        }
        return output;
    }

    /*
    * Encode a string as utf-8
    */
    function str2rstr_utf8(input) {
        return unescape(encodeURIComponent(input));
    }

    /*
    * Take string arguments and return either raw or hex encoded strings
    */
    function raw_md5(s) {
        return rstr_md5(str2rstr_utf8(s));
    }
    function hex_md5(s) {
        return rstr2hex(raw_md5(s));
    }
    function raw_hmac_md5(k, d) {
        return rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d));
    }
    function hex_hmac_md5(k, d) {
        return rstr2hex(raw_hmac_md5(k, d));
    }

    function md5(string, key, raw) {
        if (!key) {
            if (!raw) {
                return hex_md5(string);
            }
            return raw_md5(string);
        }
        if (!raw) {
            return hex_hmac_md5(key, string);
        }
        return raw_hmac_md5(key, string);
    }

    if (typeof define === 'function' && define.amd) {
        define(function () {
            return md5;
        });
    } else {
        $.md5 = md5;
    }
}(M));

/** @namespace M.util **/
M.util = {
    /**
    * 获取函数的参数名称
    * @example
    * function Add(number1, number2){}
    * M.util.parseArguNames(Add);
    * => ["number1", "number2"]
    * @param {function} fn
    * @returns {Array}
    */
    parseArguNames: function (fn) {
        var m = fn.toString().match(/.*?\((.*)?\)/);
        if(m && m[1]) {
            return m[1].split(",").map(function(i){ return i.trim();});
        }
        return [];
    },

    /**
    * 包装只有两个参数的函数, 包装后会把第二个参数开始的所有参数依次传递给原函数运行
    * @param {function(param, param2)} fn
    * @returns {function}
    */
    makeMultiTargetFn: function (fn){
        return function(){
            if(arguments.length <= 2){
                return fn(arguments[0], arguments[1]);
            }else{//3个以上
                var arg0 = arguments[0];
                for(var i=1, l=arguments.length; i<l; i++){
                    if(fn(arg0, arguments[i]) === false){
                        return false;
                    }
                }
                return true;
            }
        }
    },
    /**
     * 将值转换成其对应的引用对象
     * @param {string|number|bool} value
     * @returns {Object}
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

    /** 在函数内部调用函数自身, 代替引用auguments.callee **/
    fn: function() {
        return arguments.callee.caller.apply(this, arguments);
    },

    /**
     * 将类Array对象转换成真正的Array
     * @param  {Object} arrayLikeObj
     * @returns {Array}
     */
    parseArray: function(arrayLikeObj) {
        return Array.prototype.slice.call(arrayLikeObj, 0);
    },


    /**
     * 声明一个枚举
     * @param {...String} names enumeration key
     * @example
     * var color = M.$enum("BLUE", "RED", "YELLOW");
     * color.BLUE
     * color.RED
     * color.YELLOW
     *
     * var color = M.$enum({
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
     * 包装纯函数，包装时指定纯函数的第一参数
     * @param  {function} fn 纯函数
     * @param  {Object}   [firstParam=this] fn的第一个参数，如果未传递getFirstParam参数
     * @param  {function(firstParam)} [getFirstParam] 获取fn的第一个参数的函数，调用时将把firstParam传递给它
     * @return {function}
     */
    methodize: function(fn, firstParam, getFirstParam) {
        return function() {
            //获取第一个参数
            var p1 = firstParam || this;
            if(getFirstParam) p1 = getFirstParam(p1);

            //把第一个参数和其他参数放在一起
            var slice = Array.prototype.slice;
            var args = [p1].concat(slice.call(arguments));

            return fn.apply(this, args);
        }
    },

    /**
     * 重写对象的方法，新方法将调用overwriter并把原方法作为第一个参数传递给它
     * @param  {Object} obj 要重写方法的对象 
     * @param  {string} funcName 被重写的方法名
     * @param  {function} overwriter 真正的覆盖函数
     * @example
     * var Jim = {
     *     sayHi: function(){ return "Hi"}
     * }
     *
     * M.util.overwrite(Jim, "sayHi", function(oldFn, name){
     *     return oldFn.call(this) + ", " + name + "!";
     * })
     * 
     * Jim.sayHi("Lucy");
     * => "Hi, Lucy!"
     */
    overwrite: function(obj, funcName, overwriter) {
        var _oldFn = obj[funcName].bind(obj);
        obj[funcName] = function() {
            var args = [_oldFn].concat(Array.prototype.slice.call(arguments, 0));
            return overwriter.apply(this, args);
        };
    },

    /**
     * 生成将对象的成员导出到当前作用域的代码，该代码可被eval()正确执行,
     * 该函数生成的代码不能在strict模式下运行
     * @param  {string} [obj=this]
     * @param {string} [members] 指定要导入的成员，未指定则导入全部成员，用空格分隔成员名
     * @return {string}
     * @example
     * var Calculator = {
     *     add: function(a, b){ return a + b },
     *     sub: function(a, b){ return a - b }
     * }
     *
     * eval(M.util.dsl(Calculator));
     *
     * add(4, 6);
     * sub(10, 4);
     */
    dsl: function(obj, members) {
        obj = obj || this;

        var tempVarName =  "_temp" + Date.now() + Math.random().toString().substr(2);
        eval(tempVarName + "={value: {}}");

        var temp = eval(tempVarName);
        temp.value = obj;


        if(typeof members == "string" && members !== ""){
            members = members.split(" ").map(function(n){ return n.trim(); });
        }else if(!members){
            members = Object.keys(obj);
        }

        var codes = members.map(function(name) {
            //可以加入检查是否已经定义的功能，如已定义则警告。
            return name + "=" + tempVarName + ".value" + "['" + name + "']";
        });
        
        return "var " + codes.join(",") + ";delete " + tempVarName + ";";
    },

    /**
     * 运行指定方法，避免在全局作用域下产生全局变量
     * @param {function} fn
     */
    run: function(fn) {
        if(arguments.length == 1) {
            return fn();
        } else {
            return fn.apply(this, Array.prototype.slice.call(arguments, 1));
        }
    }
}

/** 
 * 在函数内部调用函数自身, 代替引用auguments.callee，是{@link M.util.fn}的别名
 * @memberof M
 * @function
 **/
M.$fn = M.util.fn;

/**
 * 运行指定方法，避免在全局作用域下产生全局变量，是{@link M.util.run}的别名
 * @memberof M
 * @function
 * @param {function} fn
 */
M.$run = M.util.run;

/**
 * 声明一个枚举，是{@link M.util.enumeration}的别名
 * @memberof M
 * @function
 * @param {...String} names enumeration key
 * @example
 * var color = M.$enum("BLUE", "RED", "YELLOW");
 * color.BLUE
 * color.RED
 * color.YELLOW
 *
 * var color = M.$enum({
 *  "BLUE": -1,
 *  "RED": 1
 * })
 */
M.$enum = M.util.enumeration;

/**
 * 重写对象的方法，新方法将调用overwriter并把原方法作为第一个参数传递给它，是{@link M.util.overwrite}的别名
 * @memberof M
 * @function
 * @param  {Object} obj 要重写方法的对象 
 * @param  {string} funcName 被重写的方法名
 * @param  {function} overwriter 真正的覆盖函数
 * @example
 * var Jim = {
 *     sayHi: function(){ return "Hi"}
 * }
 *
 * M.util.overwrite(Jim, "sayHi", function(oldFn, name){
 *     return oldFn.call(this) + ", " + name + "!";
 * })
 * 
 * Jim.sayHi("Lucy");
 * => "Hi, Lucy!"
 */
M.$overwrite = M.util.overwrite;

/**
 * 包装纯函数，包装时指定纯函数的第一参数，是{@link M.util.methodize}的别名
 * @memberof M
 * @function
 * @param  {function} fn 纯函数
 * @param  {Object}   [firstParam=this] fn的第一个参数，如果未传递getFirstParam参数
 * @param  {function(firstParam)} [getFirstParam] 获取fn的第一个参数的函数，调用时将把firstParam传递给它
 * @return {function}
 */
M.$methodize = M.util.methodize;

/**
 * 生成将对象的成员导出到当前作用域的代码，该代码可被eval()正确执行,
 * 该函数生成的代码不能在strict模式下运行，是{@link M.util.dsl}的别名
 * @memberof M
 * @function
 * @param  {string} [obj=this]
 * @param {string} [members] 指定要导入的成员，未指定则导入全部成员，用空格分隔成员名
 * @return {string}
 * @example
 * var Calculator = {
 *     add: function(a, b){ return a + b },
 *     sub: function(a, b){ return a - b }
 * }
 *
 * eval(M.util.dsl(Calculator));
 *
 * add(4, 6);
 * sub(10, 4);
 */
M.$dsl = M.util.dsl;

/** @namespace M.MObjectUtil **/
M.MObjectUtil = {
    /**
    * 判断name是否符合私有成员的名称规范
    * @param {string} name
    * @returns {boolean}
    */
    isPrivate: function(name) {
        return(/^__/).test(name);
    },

    /**
    * 判断name是否符合受保护成员的名称规范
    * @param {string} name
    * @returns {boolean}
    */
    isProtected: function(name) {
        return(/^_(?!_)/).test(name);
    },

    /**
    * 判断name是否符合公开成员的名称规范
    * @param {string} name
    * @returns {boolean}
    */
    isPublic: function(name) {
        return !this.isProtected(name) && !this.isPrivate(name);
    },

    /**
    * 判断对象是否拥有指定属性，该属性不能为function
    * @param {string} obj
    * @param {string} property
    * @returns {boolean}
    */
    has: function(obj, property) {
        if(!obj || !property)return false;
        if(!(/\./.test(property))){
            return obj.hasOwnProperty(property);
        }

        var names = property.split('.');

        var prop;
        var lastProp = names.pop();
        var currObj = obj;
        while(prop=names.shift()){
            currObj = currObj[prop];
            if(!currObj)return false;
        }
        return currObj.hasOwnProperty(lastProp);
    },

    /**
    * 判断对象是否可响应指定方法
    * @param {string} obj
    * @param {string} funcName
    * @returns {boolean}
    */
    can: function(obj, funcName) {
        if(!obj || !funcName)return false;

        if(!(/\./.test(funcName))){
            return typeof obj[funcName] == "function";
        }

        var names = funcName.split('.');
        var funcName = names.pop();

        var prop;
        var currObj = obj;
        while(prop=names.shift()){
            currObj = currObj[prop];
            if(!currObj)return false;
        }

        return typeof currObj[funcName] == "function";
    },

    /**
    * 遍历对象，调用指定函数
    * @param {string} obj
    * @param {function} fn
    */
    eachAll: function(obj, fn) {
        for(var p in obj) {
            if(fn(p, obj[p]) === false) break;
        }
    },

    /**
    * 遍历对象拥有的成员，调用指定函数
    * @param {string} obj
    * @param {function} fn
    */
    eachOwn: function(obj, fn) {
        for(var p in obj) {
            if(obj.hasOwnProperty(p) && this.isPublic(p)) {
                if(fn(p, obj[p]) === false) break;
            }
        }
    },

    /**
    * 遍历对象的属性（除方法外的所有成员），调用指定函数
    * @param {string} obj
    * @param {function} fn
    */
    eachProp: function(obj, fn) {
        this.eachOwn(obj, function(p, op) {
            if(typeof op != "function") {
                return fn(p, op);
            }
        });
    },

    /**
     * 根据指定属性来追溯
     * @param {Object} obj 对象
     * @param {String} prop 属性名
     * @param {function(a)} fn 处理函数(追溯到的对象)
     * @returns {boolean} 全部处理完返回true，否则false
     */
    traverseChain: function(obj, prop, fn) {
        var v = obj[prop];
        while(v) {
            if(fn(v) === false) return false;
            v = v[prop];
        }
        return true;
    },

    /**
     * clone克隆指定对象，如果对象自己有clone方法，则调用对象自己的clone方法
     * @param  {Object} obj 被克隆的对象
     * @param  {boolean} [deep=false] 是否深度克隆
     * @returns {Object}
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
                if( p == 'constructor') continue;
                var op = o[p];
                if( p == '__proto__'){
                    cloneObj[p] = op;
                    continue;
                }
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
     * copy members from src to obj
     * @param  {Object} obj [description]
     * @param  {Object} src [description]
     * @param  {String[]} [whitelist=null] 不想被覆盖的成员
     * @return {Object}
     */
    mix: function(obj, src, whitelist) {
        if(!src) return obj;
        var p;
        if(whitelist) {
            for(p in src) {
                if(whitelist.indexOf(p) == -1) {
                    obj[p] = src[p];
                }
            }
        } else {
            for(p in src) {
                obj[p] = src[p];
            }
        }
        return obj;
    },

    /**
     * 依次合并给定的所有对象到一个新的对象
     * @param {...Object} obj
     * @returns {Object} new object, merge 
     */
    merge: function(/*a,b,c,d,...*/) {
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
 * 依次合并给定的所有对象到一个新的对象，是{@link M.MObjectUtil.merge}的别名
 * @memberof M
 * @function
 * @param {...Object} obj
 * @returns {Object} new object, merge 
 */
M.$merge = M.MObjectUtil.merge;

/**
 * copy members from src to obj，是{@link M.MObjectUtil.mix}的别名
 * @memberof M
 * @function
 * @param  {Object} obj [description]
 * @param  {Object} src [description]
 * @param  {String[]} [whitelist=null] 不想被覆盖的成员
 * @return {Object}
 */
M.$mix = M.MObjectUtil.mix;

/**
 * clone克隆指定对象，如果对象自己有clone方法，则调用对象自己的clone方法，是{@link M.MObjectUtil.clone}的别名
 * @memberof M
 * @function
 * @param  {Object} obj 被克隆的对象
 * @param  {boolean} [deep=false] 是否深度克隆
 * @returns {Object}
 */
M.$clone = M.MObjectUtil.clone;

M.util.run(function(M){
    /** 
    * Mayjs的interface的原型对象
    * @memberof M
    * @type Object
    **/
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
            return objType == _getType(new Number);
        }else if(type == "string" || type == String){
            return objType == _getType(new String);
        }else if(type == "boolean" || type == Boolean){
            return objType == _getType(new Boolean);
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

    /**
    * 判断对象是否为指定类型
    * @memberof M
    * @function
    * @param {string|function|undefined} type
    * @param {...Object} obj
    * @returns {boolean}
    */
    var $is = M.util.makeMultiTargetFn(function(type, obj){
        if(_isValueType(type, obj))return true;
        if(_isInstanceof(type, obj))return true;
        return false;
    });

    /** 
    * 判断proto是否为obj的原型
    * @memberof M
    * @function
    * @param {Object} proto
    * @param {Object} obj
    * @returns {boolean}
    **/
    var $hasProto = M.util.makeMultiTargetFn(
        function(proto, obj){
            if(typeof proto != "object")return false;
            if(proto == null)return false;
            return proto.isPrototypeOf(obj);
        }
    );

    /**
    * 依次判断给定的参数是否为false，一旦发现为false立即抛出错误
    * @memberof M
    * @function
    * @param {...boolean} result
    */
    var $check = function(result, msg){
        if(result === false){
            if(msg)throw msg;
            throw "$check failed";
        }
    }

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

    /**
    * 给指定方法设定参数的元类型信息
    * @memberof M
    * @param {Object|Interface} arguTypes 参数的类型定义
    * @param {function} fn
    **/
    function $func(arguTypes, fn) {
        fn.__argu_types__ = _parseArguTypes(arguTypes, M.util.parseArguNames(fn));
        return fn;
    }


    /**
     * 创建Interface的快捷方法
     * @memberof M
     * @param  {Object} define interface define
     * @param  {Interface} base base interface
     * @returns {Interface}
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

    /**
    * 判断对象是否为指定类型或者符合指定协议
    * @private
    * @memberof M
    * @param {function|Object|Interface|string} type 类型或者协议
    * @param {Object} obj
    */
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
     * @param {Interface|Object} interface_
     * @param {Object} obj
     * @param {bool} [exactly=false] 如果为false且对象的已实现接口元信息中包含了该接口，则不再次检查是否支持
     * @returns {boolean}
     */
    function $support(interface_, obj, exactly) {
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
                if(!typeof(member) == "function"){
                    //return false;
                    throw name + " invalid";
                }
                continue;  
            }else if(!_is(type, member)){
                //return false;
                throw name + " invalid";
            } 
        }
        return true;
    }

    /**
     * 把指定协议加入对象的已实现协议元信息中，加入前检查是否支持指定协议
     * @memberof M
     * @param {Interface|Object} interface_
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

    M.$ensure = function(fn){
        try{
            return fn()
        }catch(e){
            if(typeof(console) != undefined){
                console.error && console.error(e);
            }
            return false;
        }
    }

    function $checkArgu() {
        var caller = arguments.callee.caller;
        var args = caller["arguments"];
        var arguTypes;
        if(arguments.length === 0) {
            arguTypes = caller.__argu_types__;
        } else {
            arguTypes = _parseArguTypes(Array.prototype.slice.call(arguments), M.util.parseArguNames(caller));
        }
        var type;

        for(var i = 0, l = arguTypes.length; i < l; i++) {
            type = arguTypes[i].type;
            //将方法的参数声明为undefined类型，表明其可为任何值，所以总是验证通过
            if(type === undefined) return true;
            if(!_is(type, args[i])) {
                return false;
            }
        }
        return true;
    }

    M.Interface = Interface;

    M.$interface = $interface;
    M.$support = $support;
    M.$implement = $implement;
    M.$is = $is;
    M.$hasProto = $hasProto;
    M.$checkArgu = $checkArgu;
    M.$func = $func;
    M.$check = $check;
    M._is = _is;
}, M);

M.util.run(function(M) {
    /**
     * 定义一个module，暂时啥也不干，原样返回传入的对象，标识作用
     * @memberof M
     * @param   {Object} obj
     * @returns {Object}
     */
    function $module(o) {
        return o;
    }

    /**
     * 供include module时使用的选项的接口
     * @namespace M.IModuleOption
     */
    var IModuleOption = {
        /**
         * 执行onincluded和methodize时会用到
         * @alias M.IModuleOption.context
         * @type {Object}
         */
        "[context]": Object,

        /** 
         * 是否对所有函数成员进行methodize 
         * @alias M.IModuleOption.methodize
         * @type {boolean}
         */
        "[methdize]": Boolean,

        /**
         * 通过这个函数获得methodize时的第一参数 
         * @alias M.IModuleOption.methodizeTo
         * @type {function}
         */
        "[methdizeTo]": [Object],

        /**
         * 可以被mix到哪些类型
         * @alias M.IModuleOption.supports
         * @type {Array}
         */
        "[supports]": Array,

        /**
         * 停止调用module.onIncluded，
         * 考虑类似这种情况：当include一个module类时，应该copy成员到类的prototype，module的onIncluded则在类的initialize中调用
         * @alias M.IModuleOption.stopCallback
         * @type {boolean}
         */
        "[stopCallback]": Boolean
    }

    /** 
    * module interface
    * @memberof M
    * @interface
    **/
    var IModule = {
        "[__option__]": IModuleOption,
        "[onIncluded]": Function //include给object后被自动调用，一般不用于include给prototype object
    }

    /**
     * include module to obj with option
     * @memberof M
     * @param  {Object} opt.module
     * @param  {Object} opt.to
     * @param  {Object} opt.option
     * @returns {Object}
     */
    function $include(obj, module, option) {
        var defauls = {
            "methodize": false,
            "context": null, //methodize的参数
            "methodizeTo": null, //methodize的参数
            "stopCallback": false
        };

        option = M.MObjectUtil.merge(defauls, module.__option__, option);

        var needMethodize = option.methodize;

        M.MObjectUtil.eachOwn(module, function(k, v){
            if("onIncluded" !== k && !k.match(/^__.*__$/)) {
                //var name = (option.alias && option.alias[k]) ? option.alias[k] : k;
                if(needMethodize && typeof v == "function") {
                    obj[k] = M.util.methodize(v, option.context, option.methodizeTo);
                } else {
                    obj[k] = v;
                }
            }
        });

        
        if(module.__interfaces__) {
            module.__interfaces__.forEach(function(interface_) {
                M.$implement(interface_, obj);
            });
        }

        if(!option.stopCallback && module.onIncluded) {
            module.onIncluded.call(obj, option.context || obj);
        }
    }

    M.$module = $module;
    M.$include = $include;
    M.IModuleOption =  IModuleOption;
    M.IModule = IModule;
}, M);
M.util.run(function(M) {
    var traverseChain = M.MObjectUtil.traverseChain;
    var mix = M.MObjectUtil.mix;

    /* 
    === How to understand May.js Classes ===

    Object.prototype  ◄------------┓
                                   |
                                   |
    BaseObj.__proto__  ------------┛
       ▲
       |
       ┗---------------------------┓
                                   |
    Klass.prototype.__proto__ -----┛
              ▲
              |
              ┗--------------------┓
                                   |
    BaseClass.prototype.__proto__ -┛
                  ▲
                  |
                  ┗----------------┓
                                   |
    NewClass = $class(define)      |
    NewClass.prototype.__proto__  -┛
                  ▲
                  |
                  ┗----------------┓
                                   |
    (new NewClass()).__proto__  ---┛
    */

    /**
    * @namespace
    * @memberOf M
    * @type {Object}
    */
    var BaseObj = {
        /** 
        * 元信息：已实现的接口 
        * @member
        */
        __interfaces__: [],
        /**
         * 啥也不做，有需要的时候可以在Mayjs加载后，声明实际需要做的事，
         * 覆盖这个空的
         * @return {[type]} [description]
         */
        onExtend: function(){},
        /** 初始化方法 **/
        /** 
        * 使用定义信息生成新的对象，新对象的prototype为当前对象
        * @member
        * @param {Object} objDefined 对象定义
        **/
        extend: function(objDefine){
            var obj = Object.create(this);

            if(!Object["__proto__"]) {//for IE browser
                obj["__proto__"] = this;
            }

            for(var name in objDefine){
                var member = objDefine[name]; 
                obj[name] = member;

                //add __name__ to method
                if(typeof(member) == "function"){
                    member.__name__ = name;
                }
            }

            if(typeof this.onExtend == "function")this.onExtend(obj);

            return obj;
        },
        /**
        * 模拟super关键字，访问原型链中的方法
        * @member
        */
        base: function(){
            var caller = arguments.callee.caller;
            var callerName = caller.name || caller.__name__;
            var callerOwner = this.__getCallerOwner(caller, callerName);
            if(!callerName)callerName = caller.__name__; //在this._getCallerOwner方法中会为caller设置name meta;

            var base = callerOwner ? callerOwner.__proto__ : null;
            var fn = base ? base[callerName] : null;

            if(typeof fn == "function") {
                return fn.apply(this, arguments);
            }
        },
        __getCallerOwner: function(caller, callerName){
            var callerOwner = null;
            if(callerName){
                if(this.hasOwnProperty(callerName) && this[callerName] === caller)return this;

                if(this["__proto__"][callerName] == caller){
                    return this["__proto__"];
                }

                traverseChain(this, "__proto__", function(proto) {
                    if(proto.hasOwnProperty(callerName) && proto[callerName] == caller){
                        callerOwner = proto;
                        return false;
                    }
                });
            }else{
                for(var p in this){
                    if(this[p] === caller){
                        callerOwner = this;
                        caller.__name__ = p;
                        break;
                    }
                }
                if(callerOwner)return callerOwner;

                traverseChain(this, "__proto__", function(proto) {
                    var keys = Object.keys(proto);
                    var p;
                    for(var i=0,l=keys.length; i<l; i++){
                        p = keys[i];
                        if(proto[p] === caller) {
                            callerOwner = proto;
                            caller.__name__ = p;
                            break;
                        }
                    }
                });
            }
            return callerOwner;
        }
    }


    /**
    * Klass类，{@link M.BaseObj}是其prototype
    * @inner
    * @memberof M
    <p></p>* @augments {M.BaseObj}
    * @constructor
    */
    function Klass(){}
    Klass.prototype = BaseObj.extend(/** @lends M~Klass.prototype **/{
        initialize: function(){
            /**
             * 已实现接口元信息
             * @instance
             * @type {Array}
             */
            this.__interfaces__ = [];

            var self = this;
            traverseChain(this, "__proto__", function(proto) {
                if(proto.constructor.fireInitialized){
                   proto.constructor.fireInitialized(self); 
                }
            });
        }
    });

    /** @lends M~Klass */
    var KlazzStatics = function(){
        this.__initObservers__ = [];
    }
    KlazzStatics.prototype = {
        /**
         * 触发类的oninitialize事件
         * @param  {Object} instance
         */
        fireInitialized: function(instance){
            this.__initObservers__.forEach(function(observer){
                observer.call(instance);
            });        
        },
        /**
         * 添加类的初始化事件的监听者
         * @param  {function} observer
         */
        onInitialize: function(observer){
            this.__initObservers__.push(observer);
        },
        /**
         * 包含指定的module到当前类中
         * @param  {IModule} module
         * @param  {IModuleOption} option
         */
        include: function(module, option){
            if(module.onIncluded){
                option = option || {};
                option.stopCallback = true;

                M.$include(this.prototype, module, option);
                module.onIncluded(this);
            }else{
                M.$include(this.prototype, module, option);
            }
        },      

        /**
        * 继承当前类，产生新类
        * @memberof M~Klass
        * @param {Object} classDefine
        */
        extend: function(classDefine){
            var modules = classDefine.modules;
            if(modules)delete classDefine.modules;

            var proto = this.prototype.extend(classDefine);

            //如果prototype未定义initialize，则为其添加一个
            if(!proto.hasOwnProperty("initialize")){
                proto.initialize = function(){
                    //调用父类的initiazlie
                    this.base.apply(this, arguments);
                }
            }

            var clazz;
            if(!Object["__proto__"]) {//for IE browser
                clazz = function(){
                    if(!proto.isPrototypeOf(this)){
                        return new (arguments.callee);
                    }
                    this.constructor = clazz;
                    this["__proto__"] = proto;
                    proto.initialize.apply(this, arguments);
                }
            }else{
                clazz = function(){
                    if(!proto.isPrototypeOf(this)){
                        return new (arguments.callee);
                    }
                    this.constructor = clazz;
                    proto.initialize.apply(this, arguments);
                }
            }

            proto.constructor = clazz;
            clazz.prototype = proto;
            /*
            var excludes = ["prototype"];
            for(var p in Klass){
                if(excludes.indexOf(p) == -1){
                    clazz[p] = this[p];
                }
            }*/

            M.MObjectUtil.mix(clazz, new KlazzStatics());

            if(modules && clazz.include){
                modules.forEach(function(module){
                    clazz.include(module);
                })
            }

            if(typeof this.onExtend == "function") this.onExtend(clazz);

            return clazz;
        }
    }    

    M.MObjectUtil.mix(Klass, new KlazzStatics());

    /**
    * BaseClass
    * @class
    * @augments {M~Klass}
    * @memberof M
    */
    var BaseClass = Klass.extend({})

    /**
     * May.js Object的接口
     * @memberof M
     */
    var IBase = M.$interface({
        "base": [],
        "__interfaces__": Array
    });

    M.$implement(IBase, BaseObj);


    /**
    * 定义一个Mayjs类，该类自动继承{@link M.BaseClass}
    * @memberof M
    * @param {Object} prototype 新类的prototype
    */
    function $class(prototype){
        return BaseClass.extend(prototype);
    }

    /**
    * 定义一个对象，该对象的原型为{@link M.BaseObj}
    * @memberof M
    * @param {Object} obj
    */
    function $obj(obj){
        return BaseObj.extend(obj);
    }



    M.IBase = IBase;
    M.BaseObj = BaseObj;
    M.BaseClass = BaseClass;
    M.$class = $class;
    M.$obj = $obj;
}, M);
M.util.run(function(M) {
    var toObject = M.util.toObject;
    var merge = M.MObjectUtil.merge;
    var mix = M.MObjectUtil.mix;

    var md5Proto = function(proto){
        var key = Object.keys(proto).join('');
        if(key === ''){
            key = proto.constructor.toString();
        }
        return M.md5(key);
    }

    /**
    * @memberof M
    * @class
    */
    var Wrapper = M.$class(
        /** @lends M.Wrapper.prototype **/
        {
         /**
          * @alias M.Wrapper
          * @constructor
          */
        initialize: function() {
            /**
            * type -- module map
            * @type Array
            */
            this.__map__ = [];

            /**
            * @type Object
            */
            this.__DSL__ = {
                $: this.$.bind(this),
                $$: this.$$.bind(this),
            }
            this.__DSL__.$.reg = this.$reg.bind(this);
            this.__DSL__.$.clear = this.$clear.bind(this);
        },
        __wrap: function(obj, proxy, option){
            obj = toObject(obj);
            if(!proxy){
                proxy = obj;
            }

            var wrappers = this.__findWrappersByObj(obj);
            if(wrappers.length === 0) return obj;

            wrappers.forEach(function(wrapper) {
                var includeOption = option ? merge(option, wrapper.includeOption) : wrapper.includeOption;
                M.$include(proxy, wrapper.module, includeOption);
            });

            return proxy;
        },
        /**
        * 清空wrap module表
        */
        $clear: function(){
            this.__map__ = [];
        },

        /**
        * wrap对象，非侵入
        * @param {Object} obj
        */
        $: function(obj) {
            var proxy = {
                valueOf: function(){ return obj}
            }
            return this.__wrap(obj, proxy, {context: obj});
        },

        /**
         * 直接复制wrap modules中的成员到指定对象
         * @param {Object} obj 对象
         */
        $$: function(obj) {
            return this.__wrap(obj);
        },

        /**
         * 将wrap module注册到prototype,Interface或Class
         * @param {Object} module
         * @param {Object|Interface|Function} supports 
         * @param {Object} [option] 
         */
        $reg: function(module, supports, option) {
            if(!module || typeof module != "object") return;

            var includeOption = option || module.__option__ || {};
            supports = supports || includeOption.supports;
            var types = Array.prototype.isPrototypeOf(supports) ? supports : [supports];

            for(var i=0,l=types.length; i<l; i++){
                var type = types[i];
                if(typeof type === 'function'){
                    type = type.prototype;
                }
                if(!type)continue;

                var wrapper = {
                    "module": module,
                    "includeOption": includeOption
                }

                var map = this.__map__;
                var id = md5Proto(type);
                if(!map[id]){
                    map[id] = [wrapper];
                }else{
                    var typeWrappers = map[id];
                    if(!typeWrappers.some(function(item){ return item.module === module; })){
                        typeWrappers.push(wrapper);
                    }
                }
            }
            return this;
        },

        __findWrappersByType: function(type) {
            var id = md5Proto(type);
            return this.__map__[id] || [];
        },

        /**
         * 根据prototype,Interface或Class查找已注册的wrap modules
         * @param {Object|Interface|Function} type
         * @return {Array}
         */
        findWrappersByType: function(type){
            if(this != _globalWrapper){
                return _globalWrapper.__findWrappersByType(type).concat(this.__findWrappersByType(type));
            }else{
                return this.__findWrappersByType(type);
            }
        },

        __findWrappersByPrototype: function(proto) {
            var self = this;
            var wrappers = [];
            var oldProto;

            while(proto) {
                wrappers = wrappers.concat(self.findWrappersByType(proto));
                if(proto.hasOwnProperty && proto.hasOwnProperty("__interfaces__")){
                    proto.__interfaces__.forEach(function(interface_) {
                        wrappers = wrappers.concat(self.findWrappersByType(interface_));
                    });
                }

                oldProto = proto;

                proto = oldProto["__proto__"] || (oldProto.constructor ? oldProto.constructor.prototype : null);

                if(proto == oldProto) {
                    break;
                }
            }

            return wrappers;
        },

        __findWrappersByObj: function(obj) {
            if(obj === null) return [];

            var wrappers = [];
            var self = this;
            var addTypeWrappers = function(type) {
                    wrappers = wrappers.concat(self.findWrappersByType(type));
                };

            var objType = typeof obj;
            if(objType == "object" || objType == "function") { //reference type
                wrappers = wrappers.concat(this.__findWrappersByPrototype(obj["__proto__"] || obj.constructor.prototype));
                if(obj.hasOwnProperty && obj.hasOwnProperty("__interfaces__")){
                    obj.__interfaces__.forEach(function(interface_) {
                        addTypeWrappers(interface_);
                    });
                }
            } //else { //value type
               // addTypeWrappers(objType);
            //}

            return wrappers;
        }
    });

    /**
    * 创建一个新的{@link M.Wrapper}并返回它的__DSL__
    * @memberof M
    */
    M.$wrapper = function () {
        return new Wrapper().__DSL__;
    }

    /**
    * @memberof M~_globalWrapper
    * @instance M.Wrapper
    */
    var _globalWrapper = new Wrapper();

    M.MObjectUtil.mix(M, _globalWrapper.__DSL__);

    M.Wrapper = Wrapper;
}, M);
M.util.run(function(M){
    var $func = M.$func;

    function _checkParams(fn, params) {
        var caller = fn || arguments.callee.caller;
        var paramsMeta = caller.__argu_types__;
        params = params || caller["arguments"];
        var type;
        for(var i = 0, l = params.length; i < l; i++) {
            type = paramsMeta[i].type;
            //将方法的参数声明为null类型，表明其可为任何值，所以总是验证通过
            if(type === null) return true;
            if(type instanceof RegExp){
                if(!type.test(params[i])) return false;
            }else{
                if(!M.$ensure(function(){ return M._is(type, params[i]) })){
                    //if(typeof type == "function"){ //参数的类型为function，且不是参数的原型或者构造器，则可能是验证函数
                        //@todo type.isChecker = true;
                        //if(!type(params[i]) === false)return false;
                    //}
                    return false;
                }
            }
        }
        return true;
    }

    function dispatch(overloads, params) {
        var arguCount = params.length;

        var matches = overloads.filter(function(fn) {
            return fn.__argu_types__.length >= arguCount;
        });
        
        if(matches.length == 0) return null;
        if(params.length == 0) return matches[0];

        var fn;
        while((fn = matches.shift())) {
            if(_checkParams(fn, params)) {
                return fn;
            }
        }
    }


    /**
     * function overload
     * @memberof M
     * @param {Array} paramsTypes params types
     * @param {function} fn overload function
     * @returns {function}
     * @example
     *   fn = M.$overload(["string","number"], function(name, age){
     *       return "I'm "+name+ " and I'm " + age + " years old";
     *   }).overload(["string"], function(name){
     *       return "i'm " + name;
     *   });
     *
     *   fn.overload(["string", "string"], function(name, interest){
     *       return "I'm " + name + ", and i'm interesting "+ interest;
     *   });
     *
     *   fn("lily"); // => "i'm lily"
     *   fn("lily", 18); // => "I'm lily and I'm 18 years old"
     *   fn("lily", "singing"); //=> "I'm lily, and i'm interesting singing"
     */
    function $overload(paramTypes, fn) {
        //存储重载的方法
        var _overloads = {value: []};
        var pushFn = function(paramTypes, fn){
            if(typeof paramTypes == "function"){
                fn=paramTypes;
                paramTypes = null;
                if(!fn.hasOwnProperty("__argu_types__")){
                    fn.__argu_types__ = [];
                }
            }else{
                $func(paramTypes, fn);
            }
            _overloads.value.push(fn);
        }

        pushFn(paramTypes, fn);

        var main = function() {
                var params = arguments;
                var fn = dispatch(_overloads.value, params);
                if(fn) {
                    return fn.apply(this, params);
                }
            };

        main.overload = function(paramTypes, fn) {
            pushFn(paramTypes, fn);
            //_overloads.value.push(typeof paramTypes == "function" ? paramTypes : $func(paramTypes, fn));
            _overloads.value = _overloads.value.sort(function(fn1, fn2) {
                return fn1.__argu_types__.length - fn2.__argu_types__.length;
            });

            return this;
        };


        return main;
    }

    M.$overload = $overload;
}, M);
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