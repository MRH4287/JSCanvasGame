/// <reference path="jquery.d.ts" />
var GameHandler = (function () {
    function GameHandler() {
        this.config = {
            debug: true
        };
    }
    // Global Helper Functions:
    GameHandler.prototype.getFile = function (url, callback, dataType) {
        var async = (!(typeof (callback) == "undefined"));
        dataType = (typeof (dataType) == "undefined") ? "json" : dataType;

        var tempResult = null;

        $.ajax({
            dataType: dataType,
            url: url,
            success: function (result) {
                if (async) {
                    callback(result);
                } else {
                    tempResult = result;
                }
            },
            async: async
        });

        return tempResult;
    };

    GameHandler.prototype.log = function (message) {
        var optionalParams = [];
        for (var _i = 0; _i < (arguments.length - 1); _i++) {
            optionalParams[_i] = arguments[_i + 1];
        }
        if (this.config.debug) {
            console.log(message, optionalParams);
        }
    };

    GameHandler.prototype.info = function (message) {
        var optionalParams = [];
        for (var _i = 0; _i < (arguments.length - 1); _i++) {
            optionalParams[_i] = arguments[_i + 1];
        }
        if (this.config.debug) {
            console.info(message, optionalParams);
        }
    };

    GameHandler.prototype.warn = function (message) {
        var optionalParams = [];
        for (var _i = 0; _i < (arguments.length - 1); _i++) {
            optionalParams[_i] = arguments[_i + 1];
        }
        if (this.config.debug) {
            console.warn(message, optionalParams);
        }
    };

    GameHandler.prototype.error = function (message) {
        var optionalParams = [];
        for (var _i = 0; _i < (arguments.length - 1); _i++) {
            optionalParams[_i] = arguments[_i + 1];
        }
        if (this.config.debug) {
            console.error(message, optionalParams);
        }
    };
    return GameHandler;
})();
