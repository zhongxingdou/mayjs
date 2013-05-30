var Mayjs={VERSION:"0.5",HOST:this},ObjectUtil=function(){return{has:function(a,b){return a&&a.hasOwnProperty(b)&&"function"!=typeof a[b]||!1},can:function(a,b){return a&&a[b]&&"function"==typeof a[b]||!1},eachKey:function(a,b){for(var d in a)if(!1===b(a[d]))break},eachProp:function(a,b,d){for(var c in a)if(a.hasOwnProperty(c)&&((d||!/^_/.test(c))&&"function"!=typeof a[c])&&!1===b(c,a[c]))break},eachOwn:function(a,b,d){for(var c in a)if(a.hasOwnProperty(c)&&(d||!/^_/.test(c))&&!1===b(c,a[c]))break},
trace:function(a,b,d){for(;a;){if(!1===d(a))return!1;a=a[b]}return!0},clone:function(a,b){var d={},c;for(c in a)d[c]=b?$clone(a[c]):a[c];return d},delegate:function(a,b){return a[b].bind(a)},set:function(a,b,d){a[b]=d;return a},get:function(a,b){return a[b]},call:function(a,b){var b=a[b],d=util.parseArray(arguments).split(2);return b.apply(a,d)},mix:function(a,b,d){if(!b)return a;var c;if(d&&0<d.length)for(c in b)-1==d.indexOf(c)&&(a[c]=b[c]);else for(c in b)a[c]=b[c];return a},merge:function(a,b){for(var d=
{},c=null,g,h=0,e=arguments.length;h<e;h++)if(c=arguments[h])for(g in c)d[g]=c[g];return d}}}();"undefined"!=typeof Mayjs&&Mayjs&&(Mayjs.MObjectUtil=ObjectUtil,ObjectUtil=void 0);
$global=function(a){var b=function(b,c){var g=arguments.callee;if(g.defined(b))throw b+" defined";var h=c||eval(b);a[b]=h;g=g.__variables__;-1==g.indexOf(b)&&g.push(b)};b.defined=function(b){return a.hasOwnProperty?a.hasOwnProperty(b):"undefined"!==typeof a[b]};Object.defineProperty(b,"__variables__",{value:[],writable:!0});b.del=function(b){var c=this.__variables__.indexOf(b);if(0<=c){var g=this.__variables__;this.__variables__=g.slice(0,c).concat(g.slice(c+1))}a[b]=null;delete a[b]};b.list=function(){return[].concat(this.__variables__)};
return b}(this);"undefined"!=typeof Mayjs&&Mayjs&&(Mayjs.$global=$global,$global=void 0);
var MayjsUtil={toObject:function(a){var b=typeof a,d=a;-1==["object","function"].indexOf(b)&&(d=new (eval(b.charAt(0).toUpperCase()+b.slice(1)))(a));return d},parseParamNames:function(a){return(a=a.toString().match(/.*?\((.*)?\)/))&&a[1]?a[1].split(","):[]},fn:function(){return arguments.callee.caller.apply(this,arguments)},parseArray:function(a){return Array.prototype.slice.call(a,0)},enumeration:function(a){if("object"==typeof a)return arguments[0];for(var b={},d=0,c=arguments.length;d<c;d++)b[arguments[d]]=
{};return b},methodize:function(a,b,d){var c=Array.prototype.slice;return function(){var g=b||this,g=[d?d(g):g].concat(c.call(arguments,0));return a.apply(null,g)}},overwrite:function(a,b,d){var c=a[b].bind(a);a[b]=function(){var b=[c].concat(Mayjs.util.parseArray(arguments));return d.apply(a,b)}},dsl:function(a){var a=a||this,b="_temp"+Date.now();eval(b+"={value: {}}");eval(b).value=a;return"var "+Object.keys(a).filter(function(b){return a.hasOwnProperty(b)&&"function"==typeof a[b]}).map(function(a){return a+
"="+b+".value['"+a+"']"}).join(",")+"; delete "+b},run:function(a){return 1==arguments.length?a():a.apply(this,Array.prototype.slice.call(arguments,1))}};"undefined"!=typeof Mayjs&&Mayjs&&(Mayjs.util=MayjsUtil,Mayjs.$run=MayjsUtil.run,Mayjs.$dsl=MayjsUtil.dsl,Mayjs.$fn=MayjsUtil.fn,Mayjs.$enum=MayjsUtil.enumeration,MayjsUtil=void 0);
var meta=function(){var a=function(a){/^__.*__$/.test(a)||(a="__"+a+"__");return a};return{set:function(b,d,c,g){Object.defineProperty(b,a(d),{value:c,writable:!0!==g})},get:function(b,d){return b[a(d)]},has:function(b,d){return b.hasOwnProperty(a(d))}}}();"undefined"!=typeof Mayjs&&Mayjs&&(Mayjs.meta=meta,meta=void 0);
Mayjs.$run(function(a){function b(a,b){var f=[];if(c(Array,a))if(b)for(var e=0,j=b.length;e<j;e++)f.push({name:b[e],type:a[e]});else a.forEach(function(a){i(a,function(a,b){f.push({name:a,type:b});return!1})});else f.push({name:b[0],type:d(a)});return f}function d(a,b){if(b){if(!l.isPrototypeOf(b))throw"Parameter base is not an Interface";interface_=Object.create(b)}else interface_=Object.create(l);j(interface_,a);return interface_}function c(a,b){if(null===a)return null===b;if(void 0===a)return void 0===
b;var f=!1;switch(typeof a){case "string":f=typeof b==a;break;case "object":f=l.isPrototypeOf(a)?g(a,b):a.isPrototypeOf(b);break;case "function":f=(f=a.prototype)?f.isPrototypeOf(b):b instanceof a}return f}function g(a,b){if(h.has(b,"interfaces")&&-1!=h.get(b,"interfaces").indexOf(a))return!0;for(var f in a)if(!/^__.*__$/.test(f))if(c(Array,a[f])){if(!c("function",b[f]))return!1}else if(!c(a[f],b[f]))return!1;return!0}var h=a.meta,e=a.util.parseArray,f=a.util.parseParamNames,i=a.MObjectUtil.eachOwn,
j=a.MObjectUtil.mix,l={};a.$interface=d;a.$implement=function(a,f){h.has(f,"interfaces")||h.set(f,"interfaces",[]);var e=h.get(f,"interfaces");if(-1==e.indexOf(a)){if(!g(a,f))throw"Not support interface";Object.keys(a).forEach(function(e){c(Array,a[e])&&h.set(f[e],"param_types",b(a[e]))});e.push(a)}};a.$support=g;a.$is=c;a.$checkParams=function(){for(var a=arguments.callee.caller,i=a.arguments,a=0===arguments.length?h.get(a,"param_types"):b(e(arguments),f(a)),d,j=0,g=i.length;j<g;j++){d=a[j].type;
if(null===d)break;if(!c(d,i[j]))return!1}return!0};a.$def=function(a,e){h.set(e,"param_types",b(a,f(e)));return e};a.Interface=l},Mayjs);
Mayjs.$run(function(a){var b=a.meta,d=a.util.methodize,c=a.MObjectUtil.merge,g=a.MObjectUtil.eachOwn;a.$module=function(a){return a};a.$include=function(h,e,f){var f=c({methodize:!1,context:null,methodizeTo:null,alias:null},f),i=f.methodize;g(h,function(a,b){"onIncluded"!=a&&(e[f.alias&&f.alias[a]?f.alias[a]:a]=i&&"function"==typeof b?d(b,f.context,f.methodizeTo):b)});b.has("interfaces")&&b.get("interfaces").forEach(function(b){a.$implement(b,e)});h.onIncluded&&h.onIncluded.call(e,f.context||e)}},
Mayjs);
Mayjs.$run(function(a){function b(a,b){var e=Object.create(a),c;Object.__proto__?c=function(){var a=c.prototype.initialize;a&&a.apply(this,arguments)}:(d.set(e,"proto",a,!0),c=function(){this.__proto__=e;var a=c.prototype.initialize;a&&a.apply(this,arguments)});if(!c.extend){var h=arguments.callee;c.extend=function(a){return h(this.prototype,a)}}for(var g in b){var k=b[g];"function"==typeof k&&d.set(k,"name",g);e[g]=k}d.set(e,"interfaces",[]);c.prototype=e;return c}var d=a.meta,c=a.MObjectUtil.trace,g=
a.MObjectUtil.mix,h=a.$interface({initialize:[],base:[],__interfaces__:Array}),e=b(Object.prototype,{initialize:function(){d.set(this,"interfaces",[])},_callerOwner:function(a,b){var e=null;if(b){if(this.__proto__[b]==a)return this.__proto__;c(this,"__proto__",function(c){if(c.hasOwnProperty(b)&&c[b]==a)return e=c,!1})}else c(this,"__proto__",function(b){Object.keys(b).forEach(function(c){if(b[c]==a)return e=b,d.set(a,"name",c),!1})});return e},base:function(){var a=arguments.callee.caller,b=a.name||
d.get(a,"name"),e=this._callerOwner(a,b);b||(b=d.get(a,"name"));b=(a=e?d.get(e,"proto"):null)?a[b]:null;if("function"==typeof b)return b.apply(this,arguments)}});a.$implement(h,e.prototype);e.extend=function(a){var e=b(this.prototype,a);a.initialize||(e.prototype.initialize=function(){this.base()});return e};a.$extend=b;a.Base=e;a.IBase=h;a.$class=function(a){return e.extend(a)};a.$obj=function(a){var b=new e;g(b,a);return b}},Mayjs);
Mayjs.$run(function(a){function b(b){var b=d(b),f=arguments.callee.findWrappersByObj(b);if(0===f.length)return b;var i={};f.forEach(function(f){a.$include(f.module,i,c({context:b},f.includeOption))});return i}var d=a.util.toObject,c=a.MObjectUtil.merge,g=a.MObjectUtil.mix,h=a.meta;h.set(b,"map",[]);g(b,{findWrappersByType:function(a){var c=h.get(b,"map").filter(function(b){return b.type==a});return 0===c.length?[]:c[0].modules},findWrappersByPrototype:function(a){for(var c=[],d;a&&!(c=c.concat(this.findWrappersByType(a)),
h.has(a,"interfaces")&&h.get(a,"interfaces").forEach(function(a){c=c.concat(b.findWrappersByType(a))}),d=a,a=d.__proto__||(d.constructor?d.constructor.prototype:null),a==d););return c},findWrappersByObj:function(a){if(null===a)return[];var c=[],d=typeof a;"object"==d||"function"==d?(c=c.concat(b.findWrappersByPrototype(a.__proto__||a.constructor.prototype)),h.has(a,"interfaces")&&h.get(a,"interfaces").forEach(function(a){c=c.concat(b.findWrappersByType(a))})):c=c.concat(b.findWrappersByType(d));return c},
exists:function(a,c){return 0<h.get(b,"map").filter(function(b){return b.type==a}).filter(function(a){return a.module==c}).length},regist:function(a,b,c){if(a!=Function.prototype&&("function"==typeof a&&(a=a.prototype),a!=Function.prototype&&(!a||-1==["string","object"].indexOf(typeof a))))return;if("object"==typeof b){var d=h.get(this,"map"),g=d.filter(function(b){return b.type==a}),c={module:b,includeOption:c};0===g.length?(g={type:a,modules:[c]},d.push(g)):0===g[0].modules.filter(function(a){return a.module==
b}).length&&g[0].modules.push(c);return this}}});a.$=b;a.$$=function(c){var c=d(c),g=b.findWrappersByObj(c);if(0===g.length)return c;g.forEach(function(b){a.$include(b.module,c,b.includeOption)});return c}},Mayjs);
Mayjs.$run(function(a){function b(b,c){for(var e=b||arguments.callee.caller,f=d.get(e,"param_types"),c=c||e.arguments,i=0,j=c.length;i<j;i++){e=f[i].type;if(null===e)break;if(!a.$is(e,c[i]))return!1}return!0}var d=a.meta,c=a.$def;a.$overload=function(a,h){var e=["function"==typeof a?a:c(paramsTypes,h)],f=function(){var a=arguments,c;a:{c=a;var g=c.length,f=function(a){return d.get(a,"param_types")},h=e.filter(function(a){return f(a).length>=g});if(1>=h.length)c=h[0];else{for(var h=h.sort(function(a,
b){return f(a).length-f(b).length}),k;k=h.shift();)if(b(k,c)){c=k;break a}c=void 0}}if(c)return c.apply(this,a)};f.overload=function(a,b){e.push("function"==typeof a?a:c(a,b));return this};return f}},Mayjs);
Mayjs.$run(function(a){var b=a.util.methodize,d=a.util.parseParamNames;a.dsl={$:a.$,$$:a.$$,$checkParams:a.$checkParams,$class:a.$class,$dsl:a.$dsl,$def:a.$def,$enum:a.util.enumeration,$fn:a.util.fn,$global:a.$global,$implement:a.$implement,$interface:a.$interface,$is:a.$is,$module:a.$module,$obj:a.$obj,$run:a.$run,$support:a.$support};a.DSL=function(){return a.$dsl(a.dsl)};a.MFunctionUtil=a.$module({overload:function(b,d,h){b=a.$overload(b);b.overload(d,h);return b},paramNames:function(a){return d(a)},
methodize:b});a.MObjectUtil=a.$module(a.MObjectUtil);a.MObjectUtil.mix(a.MObjectUtil,{meta:a.meta.get,setMeta:a.meta.set,hasMeta:a.meta.has,include:function(b,d,h){return a.$include(d,b,h)},overwrite:a.util.overwrite});a.$include(a.MObjectUtil,a.Base.prototype,{methodize:!0});a.$.regist(Object,a.MObjectUtil,{methodize:!0});a.$.regist(Function,a.MFunctionUtil,{methodize:!0})},Mayjs);
