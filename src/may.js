/**
 * @require $global
 * @require MObjectUtil
 * @require meta
 * @require MayjsUtil
 */

Mayjs = {VERSION: "0.0.1"}

Mayjs.DSL = function(){
    return Mayjs.util.importMembers(Mayjs.$global);
}

if(typeof(module) !== "undefined") module.exports = Mayjs;

Mayjs.MObjectUtil = MObjectUtil;
$global("$mix", MObjectUtil.mix);
$global("$merge", MObjectUtil.merge);
$global("$clone", MObjectUtil.clone);
delete MObjectUtil;

Mayjs.util = MayjsUtil;
$global("$run", MayjsUtil.run);
$global("$importMembers", MayjsUtil.importMembers);
$global("$fn", MayjsUtil.fn);
$global("$enum", MayjsUtil.enumeration);
delete MayjsUtil;

Mayjs.meta = meta;
delete meta;

Mayjs.$global = $global;
delete $global;
//hello