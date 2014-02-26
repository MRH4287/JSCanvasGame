/// <reference path="jquery.d.ts" />
/// <reference path="eventHandler.ts" />
/// <reference path="interfaces.ts" />
var GameHandler = (function () {
    function GameHandler(config) {
        this.config = {
            debug: true,
            width: 800,
            height: 300,
            tileSize: 25,
            elementsPath: "data/elements.json",
            mapPath: "data/map2.json",
            showBlocking: true,
            verbose: false
        };
        this.elements = {};
        this.animations = {};
        this.config = $.extend(this.config, config);
    }
    GameHandler.prototype.init = function () {
        this.loadConfig();
        this.initAnimations();

        var self = this;
        window.setTimeout(function () {
            self.loadMap();
        }, 100);
    };

    GameHandler.prototype.initAnimationContainer = function () {
        this.playerAnimationHander = this.createAnimationHandler(1, this.renderer.getPlayerLayer());
    };

    GameHandler.prototype.createAnimationHandler = function (level, layer) {
        var handler = new AnimationHandler(this, level);
        handler.setLayer(layer);

        return handler;
    };

    GameHandler.prototype.setRenderer = function (renderer) {
        this.renderer = renderer;
    };

    GameHandler.prototype.setEventHandler = function (eventHandler) {
        this.eventHandler = eventHandler;
    };

    GameHandler.prototype.initAnimations = function () {
        this.spriteContainer = {};

        // Load Animations of Elements ...
        var self = this;
        $.each(self.elements, function (ID, el) {
            if ((el.Dynamic !== undefined) && (el.Dynamic == true) && (el.AnimationDefinition !== undefined) && (el.AnimationDefinition != "")) {
                self.loadAnimation(el.AnimationDefinition);
            }
        });
    };

    GameHandler.prototype.loadAnimation = function (path) {
        var data = this.getFile(path);

        var container = {
            ID: data.ID,
            ImageURI: data.ImageURI,
            Animations: {}
        };

        for (var i = 0; i < data.Animations.length; i++) {
            var anim = data.Animations[i];
            container.Animations[anim.ID] = anim;
        }

        this.animations[data.ID] = container;
        this.preloadImage(data.ID, data.ImageURI);
        //console.log(this.animations);
    };

    GameHandler.prototype.preloadImage = function (name, path) {
        var self = this;
        this.loadImage(path, function (result) {
            self.log("Preload of Image '" + name + "' done: ", result);

            self.spriteContainer[name] = result;
        });
    };

    GameHandler.prototype.loadImage = function (path, callback) {
        var imageObj = new Image();

        imageObj.onload = function () {
            callback(imageObj);
        };

        imageObj.src = path;
    };

    GameHandler.prototype.loadConfig = function () {
        this.eventHandler.callEvent("preConfigLoad", this, null);

        this.log("Load Config from path: ", this.config.elementsPath);

        var result = this.getFile(this.config.elementsPath);

        var self = this;

        $.each(result, function (_, el) {
            self.elements[el.ID] = el;
        });

        this.log("Element Definitions loaded: ", this.elements);

        if (this.renderer !== undefined) {
            console.log(this.renderer);

            this.renderer.setConfig(this.elements);
        }

        this.eventHandler.callEvent("postConfigLoad", this, null);
    };

    GameHandler.prototype.loadMap = function () {
        this.eventHandler.callEvent("preMapLoad", this, null);

        this.log("Load Map from path:", this.config.mapPath);

        var result = this.getFile(this.config.mapPath);

        if (this.renderer !== undefined) {
            this.renderer.initMap(result[0].length, result.length);
        }

        // Has to be done here
        this.initAnimationContainer();

        for (var y = 0; y < result.length; y++) {
            var collom = result[y];

            for (var x = 0; x < collom.length; x++) {
                result[y][x] = this.updateTile(result[y][x], x + 1, y + 1);
            }
        }
        this.map = result;

        if (this.renderer !== undefined) {
            this.renderer.setMap(this.map);
        }

        //_staticHeight = _map.length * _config.tileSize;
        //_staticWidth = _map[0].length * _config.tileSize;
        //_initLayer();
        this.log("Map Loaded: ", this.map);

        this.eventHandler.callEvent("postMapLoad", this, null);
    };

    GameHandler.prototype.updateTile = function (tile, x, y) {
        tile.XCoord = x;
        tile.YCoord = y;

        this.eventHandler.callEvent("preTileUpdate", this, tile);

        if ((tile.BottomElementID !== undefined) && (tile.BottomElementID != null) && (tile.BottomElementID != "")) {
            if (this.elements[tile.BottomElementID] !== undefined) {
                tile.BottomElement = this.elements[tile.BottomElementID];
            } else {
                this.warn("Warning: No Element definintion '" + tile.BottomElementID + "' for Tile: ", tile);
            }
        }

        if ((tile.MiddleElementID !== undefined) && (tile.MiddleElementID != null) && (tile.MiddleElementID != "")) {
            if (this.elements[tile.MiddleElementID] !== undefined) {
                tile.MiddleElement = this.elements[tile.MiddleElementID];
            } else {
                this.warn("Warning: No Element definintion '" + tile.MiddleElementID + "' for Tile: ", tile);
            }
        }

        if ((tile.TopElementID !== undefined) && (tile.TopElementID != null) && (tile.TopElementID != "")) {
            if (this.elements[tile.TopElementID] !== undefined) {
                tile.TopElement = this.elements[tile.TopElementID];
            } else {
                this.warn("Warning: No Element definintion '" + tile.TopElementID + "' for Tile: ", tile);
            }
        }

        this.eventHandler.callEvent("postTileUpdate", this, tile);

        return tile;
    };

    // ---------------------------------------
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
