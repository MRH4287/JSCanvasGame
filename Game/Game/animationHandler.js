/// <reference path="jquery.d.ts" />
/// <reference path="eventHandler.ts" />
/// <reference path="renderer.d.ts" />
var AnimationHandler = (function () {
    function AnimationHandler(data) {
        this.eventHandler = data.eventHandler;
        this.spriteContainer = {};
        this.renderer = data.renderer;

        var self = this;
        this.eventHandler.addEventListener("render", function () {
            self.renderAnimations();
        });
    }
    AnimationHandler.prototype.setLayer = function (layer) {
        this.canvas = layer.canvas;
        this.ctx = layer.ctx;

        var el = $(this.canvas);
        this.width = el.width();
        this.height = el.height();

        this.preloadImage("pichu", "graphics/animations/pichu.png");
    };

    AnimationHandler.prototype.test = function () {
        var self = this;

        //ForceRerender
        window.setTimeout(function () {
            self.eventHandler.callEvent("forceRerender", this, null);
        }, 10);
    };

    AnimationHandler.prototype.renderAnimations = function () {
        this.renderer.clearRenderContext(this.ctx);

        // Debug Code:
        this.drawImage("pichu", 4, 5, 32, 32, 0, 0, 32, 32);
    };

    AnimationHandler.prototype.preloadImage = function (name, path) {
        var self = this;
        this.loadImage(path, function (result) {
            self.spriteContainer[name] = result;
        });
    };

    AnimationHandler.prototype.loadImage = function (path, callback) {
        var imageObj = new Image();

        imageObj.onload = function () {
            callback(imageObj);
        };

        imageObj.src = path;
    };

    AnimationHandler.prototype.drawImage = function (name, offsetX, offsetY, width, height, canvasOffsetX, canvasOffsetY, canvasImageWidth, canvasImageHeight) {
        if (this.spriteContainer[name] === undefined) {
            console.warn("No sprite with name '" + name + "' was found!");
            return;
        }

        this.ctx.drawImage(this.spriteContainer[name], offsetX, offsetY, width, height, canvasOffsetX, canvasOffsetY, canvasImageWidth, canvasImageHeight);
    };
    return AnimationHandler;
})();
