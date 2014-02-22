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

    GameHandler.prototype.log = function (message, objects) {
        if (this.config.debug) {
            console.log(message, objects);
        }
    };

    GameHandler.prototype.info = function (message, objects) {
        if (this.config.debug) {
            console.info(message, objects);
        }
    };

    GameHandler.prototype.warn = function (message, objects) {
        if (this.config.debug) {
            console.warn(message, objects);
        }
    };

    GameHandler.prototype.error = function (message, objects) {
        if (this.config.debug) {
            console.error(message, objects);
        }
    };
    return GameHandler;
})();
