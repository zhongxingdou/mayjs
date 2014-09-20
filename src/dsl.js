M.util.run(function(M) {
    M.$merge = M.MObjectUtil.merge;
    M.$mix = M.MObjectUtil.mix;
    M.$clone = M.MObjectUtil.clone;

    M.$fn = M.util.fn;
    M.$run = M.util.run;
    M.$enum = M.util.enumeration;
    M.$overwrite = M.util.overwrite;
    M.$methodize = M.util.methodize;
    M.$dsl = M.util.dsl;

    var _getKeywordFunc = function(){
        return Object.keys(M).filter(function(name){
            return (/^\$/).test(name) && ["$", "$$"].indexOf(name) == -1;
        });
    }

    M.importDSL = function() {
        return M.util.dsl(M, _getKeywordFunc()) + M.util.dsl(M.$wrapper());
    }

    M.exportKeyFnTo = function(targetObj){
        _getKeywordFunc().forEach(function (prop) {
            targetObj[prop] = M[prop];
        });
    }
}, M);