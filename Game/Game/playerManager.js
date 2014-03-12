/// <reference path="jquery.d.ts" />
/// <reference path="eventHandler.ts" />
/// <reference path="interfaces.ts" />
/// <reference path="animationHandler.ts" />
var PlayerState;
(function (PlayerState) {
    PlayerState[PlayerState["Standing"] = 0] = "Standing";
    PlayerState[PlayerState["Walking"] = 1] = "Walking";
})(PlayerState || (PlayerState = {}));

var WalkDirection;
(function (WalkDirection) {
    WalkDirection[WalkDirection["Up"] = 0] = "Up";
    WalkDirection[WalkDirection["Down"] = 1] = "Down";
    WalkDirection[WalkDirection["Left"] = 2] = "Left";
    WalkDirection[WalkDirection["Right"] = 3] = "Right";
    WalkDirection[WalkDirection["None"] = 4] = "None";
})(WalkDirection || (WalkDirection = {}));

var PlayerManager = (function () {
    function PlayerManager(gameHandler, animationHandler) {
        this.position = {
            X: 0,
            Y: 0
        };
        this.targetPosition = {
            X: 0,
            Y: 0
        };
        this.playerSpeed = 1.2;
        this.updatesPerSecond = 10;
        this.playerElementName = "player";
        this.playerState = 0 /* Standing */;
        this.moveDirection = 4 /* None */;
        // Keycodes:
        /*
        39 - right
        37 - left
        38 - up
        40 - down
        13 - return
        32 - space
        27 - escape
        */
        this.Keys = {
            up: 38,
            left: 37,
            right: 39,
            down: 40,
            action: 13
        };
        this.gameHandler = gameHandler;
        this.playerAnimation = animationHandler;

        var self = this;
        this.gameHandler.eventHandler.addEventListener("postInit", function (s, e) {
            self.init();
        });
    }
    PlayerManager.prototype.test = function () {
        this.initMove(3 /* Right */);
        //this.initMove(WalkDirection.Left);
        //this.initMove(WalkDirection.Up);
        //this.initMove(WalkDirection.Down);
    };

    PlayerManager.prototype.initMove = function (direction, callback) {
        if (this.playerState == 1 /* Walking */) {
            this.gameHandler.log("Player is already walking");
            return;
        }

        var walkOffset = {
            X: 0,
            Y: 0
        };
        var animation = "stand";
        var idleAnimation = "stand";

        switch (direction) {
            case 3 /* Right */:
                walkOffset.X = 1;
                animation = "walk-right";
                idleAnimation = "stand-right";
                break;

            case 2 /* Left */:
                walkOffset.X = -1 * 1;
                animation = "walk-left";
                idleAnimation = "stand-left";
                break;

            case 0 /* Up */:
                walkOffset.Y = -1 * 1;
                animation = "walk-up";
                idleAnimation = "stand-up";
                break;

            case 1 /* Down */:
                walkOffset.Y = 1;
                animation = "walk-down";
                idleAnimation = "stand";
                break;
        }

        this.playerAnimation.playAnimation(this.playerElementName, idleAnimation, "");

        var target = {
            X: this.position.X + walkOffset.X,
            Y: this.position.Y + walkOffset.Y
        };

        this.gameHandler.log("Want to move to: ", target);
        this.gameHandler.log("Play Animation: ", animation);

        if (this.gameHandler.isCoordPassable(target.X, target.Y)) {
            var offsetPerUpdate = (1 / this.playerSpeed) / this.updatesPerSecond;
            var intervall = (1 / this.updatesPerSecond) * 1000;

            this.targetPosition = target;
            this.moveDirection = direction;

            this.playerState = 1 /* Walking */;

            // Start Animation:
            this.playerAnimation.playAnimation(this.playerElementName, animation, "");

            var self = this;
            this.positionUpdateStep(this, direction, offsetPerUpdate, intervall, function () {
                self.moveFinishedCallback();

                if (callback !== undefined) {
                    callback();
                }
            });
        } else {
            this.gameHandler.log("Target not passable: ", target);
        }
    };

    PlayerManager.prototype.moveFinishedCallback = function () {
        var animation = "stand";

        switch (this.moveDirection) {
            case 3 /* Right */:
                animation = "stand-right";
                break;

            case 2 /* Left */:
                animation = "stand-left";
                break;

            case 0 /* Up */:
                animation = "stand-up";
                break;

            case 1 /* Down */:
                animation = "stand";
                break;
        }

        this.playerAnimation.playAnimation(this.playerElementName, animation, "");
        this.playerState = 0 /* Standing */;
    };

    PlayerManager.prototype.positionUpdateStep = function (self, direction, offsetPerUpdate, intervall, callback) {
        var walkOffset = {
            X: 0,
            Y: 0
        };

        switch (direction) {
            case 3 /* Right */:
                walkOffset.X = offsetPerUpdate;
                break;

            case 2 /* Left */:
                walkOffset.X = -1 * offsetPerUpdate;
                break;

            case 0 /* Up */:
                walkOffset.Y = -1 * offsetPerUpdate;
                break;

            case 1 /* Down */:
                walkOffset.Y = offsetPerUpdate;
                break;
        }

        //self.gameHandler.log("Walk Offset: ", walkOffset);
        var newPosition = {
            X: self.position.X + walkOffset.X,
            Y: self.position.Y + walkOffset.Y
        };

        var normalizedPosition = {
            X: Math.round(newPosition.X),
            Y: Math.round(newPosition.Y)
        };

        if ((((direction == 3 /* Right */) && (newPosition.X > self.targetPosition.X)) || ((direction == 2 /* Left */) && (newPosition.X < self.targetPosition.X)) || ((direction == 0 /* Up */) && (newPosition.Y < self.targetPosition.Y)) || ((direction == 1 /* Down */) && (newPosition.Y > self.targetPosition.Y)))) {
            self.position = normalizedPosition;
            self.playerAnimation.setPosition(self.playerElementName, normalizedPosition.X, normalizedPosition.Y);
            console.log("Movement done!");

            if (callback !== undefined) {
                callback();
            }
        } else {
            self.position = newPosition;
            self.playerAnimation.setPosition(self.playerElementName, newPosition.X, newPosition.Y);

            //console.log("Position updated: ", newPosition);
            window.setTimeout(function () {
                self.positionUpdateStep(self, direction, offsetPerUpdate, intervall, callback);
            }, intervall);
        }
    };

    PlayerManager.prototype.init = function () {
        var self = this;

        // Add Player to the Game:
        this.position.X = 6;
        this.position.Y = 6;

        this.initPlayer(self);

        // Bind Events here .. etc.
        $(document).keydown(function (event) {
            self.playerAnimation.stopAnimation(self.playerElementName);

            switch (event.keyCode) {
                case self.Keys.up:
                    self.initMove(0 /* Up */);
                    break;

                case self.Keys.right:
                    self.initMove(3 /* Right */);
                    break;

                case self.Keys.down:
                    self.initMove(1 /* Down */);
                    break;

                case self.Keys.left:
                    self.initMove(2 /* Left */);
                    break;

                case self.Keys.action:
                    self.playerAnimation.playAnimation(self.playerElementName, "sleep", "");
                    break;
            }
        });
    };

    PlayerManager.prototype.initPlayer = function (self) {
        self.gameHandler.loadAnimation("data/animations/pichu.json");
        self.playerAnimation.addAnimation(this.playerElementName, "pichu", "stand", this.position.X, this.position.Y);
    };
    return PlayerManager;
})();
