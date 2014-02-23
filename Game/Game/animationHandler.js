/// <reference path="jquery.d.ts" />
/// <reference path="eventHandler.ts" />
/// <reference path="gameHandler.ts" />
/// <reference path="renderer.d.ts" />
var AnimationHandler = (function () {
    function AnimationHandler(data) {
        this.animations = {};
        this.playableAnimations = {};
        this.eventHandler = data.eventHandler;
        this.spriteContainer = {};
        this.renderer = data.renderer;
        this.gameHandler = data.gameHandler;

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
    };

    AnimationHandler.prototype.test = function () {
        this.loadAnimation("data/animations/pichu.json");

        this.addAnimation("test", "pichu", "sleep", 6, 6);

        console.log(this.playableAnimations);

        var self = this;

        //ForceRerender
        window.setTimeout(function () {
            //self.eventHandler.callEvent("forceRerender", this, null);
        }, 10);
    };

    AnimationHandler.prototype.addAnimation = function (ElementID, containerName, startAnimation, x, y) {
        var container = this.animations[containerName];
        var animation = container.Animations[startAnimation];

        var element = {
            ID: ElementID,
            AnimationContainer: container,
            X: x,
            Y: y,
            Animation: null
        };

        this.playableAnimations[ElementID] = element;

        this.playAnimation(ElementID, startAnimation);
        // TODO: Add Timed Event for Animation!
    };

    AnimationHandler.prototype.getNewAnimationInstance = function (input) {
        return jQuery.extend({}, input);
    };

    AnimationHandler.prototype.playAnimation = function (elementID, animation) {
        var container = this.playableAnimations[elementID];

        if ((container.Animation != null) && (container.Animation.ID == animation)) {
            this.gameHandler.warn("Animation '" + animation + "' is allready running for '" + elementID + "'");
            return;
        }

        this.stopAnimation(elementID);

        var newAnimation = this.getNewAnimationInstance(container.AnimationContainer.Animations[animation]);
        container.Animation = newAnimation;

        var timerName = "anim-" + container.ID + "-" + container.Animation.ID;

        //this.gameHandler.log(timerName);
        //this.gameHandler.log(container);
        if ((newAnimation.ImageCount > 0) && (newAnimation.Speed > 0)) {
            var self = this;
            this.eventHandler.addTimer(timerName, function () {
                //self.gameHandler.log("Timer Event for: ", timerName);
                self.animationStep(container);
            }, newAnimation.Speed);
        }
    };

    AnimationHandler.prototype.stopAnimation = function (elementID) {
        var container = this.playableAnimations[elementID];

        if (container.Animation == null) {
            return;
        }

        // Remove Timer for Animation:
        var timerName = "anim-" + container.ID + "-" + container.Animation.ID;
        if (this.eventHandler.containesKey(timerName)) {
            this.eventHandler.stopTimer(timerName);
        }
    };

    AnimationHandler.prototype.animationStep = function (animation) {
        var anim = animation.Animation;
        var state = anim.AnimationState;

        state += (anim.IsReverse) ? -1 : 1;

        if ((state >= anim.ImageCount) || (state < 0)) {
            // End of Animation reached:
            if (anim.Loop) {
                if (anim.ReverseOnEnd) {
                    if (anim.IsReverse) {
                        anim.AnimationState = 0;
                        anim.IsReverse = false;
                    } else {
                        anim.AnimationState = anim.ImageCount - 1;
                        anim.IsReverse = true;
                    }
                } else {
                    if (anim.IsReverse) {
                        anim.AnimationState = anim.ImageCount - 1;
                    } else {
                        anim.AnimationState = 0;
                    }
                }
            } else {
                this.stopAnimation(animation.ID);
            }
        } else {
            anim.AnimationState = state;
        }

        this.eventHandler.callEvent("forceRerender", this, null);
    };

    AnimationHandler.prototype.loadAnimation = function (path) {
        var data = this.gameHandler.getFile(path);

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

    AnimationHandler.prototype.getPosition = function (x, y) {
        var tileSize = this.renderer.getTileSize();
        var result = {
            x: ((x - 1) * tileSize),
            y: ((y - 1) * tileSize)
        };

        return result;
    };

    AnimationHandler.prototype.renderAnimations = function () {
        this.renderer.clearRenderContext(this.ctx);

        // Debug Code:
        //this.drawImage("pichu", 4, 5, 32, 32, 0, 0, 32, 32);
        var self = this;
        $.each(this.playableAnimations, function (id, el) {
            var pos = self.getPosition(el.X, el.Y);
            self.renderAninmation(el.AnimationContainer, el.Animation, pos.x, pos.y);
        });
        /*
        if (this.animations["pichu"] !== undefined)
        {
        this.gameHandler.log("Drawing Animation ...");
        
        
        
        var anim: InternalAnimationContainer = this.animations["pichu"];
        this.renderAninmation(anim, anim.Animations["sleep"], pos.x, pos.y);
        }
        */
    };

    AnimationHandler.prototype.renderAninmation = function (container, animation, x, y) {
        var imageID = container.ID;

        var imageX = animation.StartX + (animation.OffsetX) * animation.AnimationState;
        var imageY = animation.StartY + (animation.OffsetY) * animation.AnimationState;

        var tileSize = this.renderer.getTileSize();

        var width = animation.DisplayWidth * tileSize;
        var height = animation.DisplayHeight * tileSize;

        //this.gameHandler.log(animation);
        //this.gameHandler.log("ImageID = ['" + imageID + "'], imageX = ['" + imageX + "'], imageY = ['" + imageY + "'], width = ['" + width + "'], height = ['" + height + "']");
        var xPos = x + animation.DisplayOffsetX * tileSize;
        var yPos = y + animation.DisplayOffsetY * tileSize;

        this.drawImage(imageID, imageX, imageY, animation.ImageWidth, animation.ImageHeight, xPos, yPos, width, height);
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
