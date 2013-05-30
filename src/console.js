if(typeof(console) == "undefined") {
    console = {};
    ["info", "log", "error", "debug", "warn", "trace", "dir"].forEach(function(name) {
        console["name"] = function() {};
    });
}

