/// <reference path="jquery.d.ts" />
/// <reference path="eventHandler.ts" />
/// <reference path="interfaces.ts" />
/// <reference path="animationHandler.ts" />
var PlayerManager = (function () {
    function PlayerManager(gameHandler, animationHandler, playerModel) {
        if (typeof playerModel === "undefined") { playerModel = "pichu"; }
        this.position = {
            X: 0,
            Y: 0
        };
        this.targetPosition = {
            X: 0,
            Y: 0
        };
        this.playerSpeed = 0.5;
        this.updatesPerSecond = 20;
        this.playerElementName = "player";
        this.playerState = 0 /* Standing */;
        this.moveDirection = 4 /* None */;
        this.lastAction = Date.now();
        this.DisplaySpeechBubbleTo = undefined;
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
        this.KeysDown = {};
        this.gameHandler = gameHandler;
        this.playerAnimation = animationHandler;

        var self = this;
        this.gameHandler.eventHandler.addEventListener("postInit", function (s, e) {
            self.init(playerModel);
        });

        this.gameHandler.eventHandler.addEventListener("CheckIsPassable", function (s, data) {
            if ((data.X == self.position.X) && (data.Y == self.position.Y)) {
                data.result = false;
            }
        });

        this.gameHandler.eventHandler.addEventListener("NPCSpeechBubbleCheck", function () {
            if (self.DisplaySpeechBubbleTo !== undefined) {
                if (self.DisplaySpeechBubbleTo < Date.now()) {
                    self.removeSpeechBubble();
                    self.DisplaySpeechBubbleTo = undefined;
                }
            }
        });
    }
    PlayerManager.prototype.initMove = function (direction, initialCall, callback) {
        if (typeof initialCall === "undefined") { initialCall = true; }
        if ((this.playerState == 1 /* Walking */) && initialCall) {
            this.gameHandler.log("Player is already walking");
            return;
        }

        // Set Last Action
        this.lastAction = Date.now();

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

        if (initialCall) {
            this.playAnimation(idleAnimation);
        }

        var target = {
            X: this.position.X + walkOffset.X,
            Y: this.position.Y + walkOffset.Y
        };

        //this.gameHandler.log("Want to move to: ", target);
        //this.gameHandler.log("Play Animation: ", animation);
        this.moveDirection = direction;

        if (this.gameHandler.isCoordPassable(target.X, target.Y)) {
            this.gameHandler.eventHandler.callEvent("PlayerStartMoving", this, {
                Target: target,
                Direction: direction,
                Speed: this.playerSpeed,
                Position: this.position
            });

            var offsetPerUpdate = (1 / this.playerSpeed) / this.updatesPerSecond;
            var intervall = (1 / this.updatesPerSecond) * 1000;

            this.targetPosition = target;

            this.playerState = 1 /* Walking */;

            // Start Animation:
            if (initialCall) {
                this.playAnimation(animation);
            }

            var self = this;
            this.positionUpdateStep(this, direction, offsetPerUpdate, intervall, function () {
                self.moveFinishedCallback();

                if (callback !== undefined) {
                    callback();
                }
            });
        } else {
            this.gameHandler.log("Target not passable: ", target);
            this.playerState = 0 /* Standing */;
        }
    };

    PlayerManager.prototype.moveFinishedCallback = function () {
        var animation = "stand";

        var walkAgain = false;

        switch (this.moveDirection) {
            case 3 /* Right */:
                animation = "stand-right";
                walkAgain = this.keyDown(this.Keys.right);
                break;

            case 2 /* Left */:
                animation = "stand-left";
                walkAgain = this.keyDown(this.Keys.left);
                break;

            case 0 /* Up */:
                animation = "stand-up";
                walkAgain = this.keyDown(this.Keys.up);
                break;

            case 1 /* Down */:
                animation = "stand";
                walkAgain = this.keyDown(this.Keys.down);
                break;
        }

        if (!walkAgain) {
            this.playAnimation(animation);
            this.playerState = 0 /* Standing */;

            this.gameHandler.eventHandler.callEvent("PlayerStopMoving", this, null);
        } else {
            this.initMove(this.moveDirection, false);
        }
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

            self.gameHandler.eventHandler.callEvent("PlayerPositionChanged", this, normalizedPosition);

            //console.log("Movement done!");
            if (callback !== undefined) {
                callback();
            }
        } else {
            self.position = newPosition;
            self.playerAnimation.setPosition(self.playerElementName, newPosition.X, newPosition.Y);
            self.gameHandler.eventHandler.callEvent("PlayerPositionChanged", this, newPosition);

            //console.log("Position updated: ", newPosition);
            self.gameHandler.eventHandler.callEvent("TaskCreated", self, "Player - PositionUpdateStep");
            window.setTimeout(function () {
                self.positionUpdateStep(self, direction, offsetPerUpdate, intervall, callback);

                self.gameHandler.eventHandler.callEvent("TaskDisposed", self, "Player - PositionUpdateStep");
            }, intervall);
        }
    };

    PlayerManager.prototype.init = function (playerModel) {
        if (typeof playerModel === "undefined") { playerModel = "pichu"; }
        var self = this;

        // Add Player to the Game:
        this.position.X = 6;
        this.position.Y = 6;

        // Get Player Tile:
        var tiles = this.gameHandler.getTilesByFlagName("player");
        if (tiles.length != 0) {
            this.position.X = tiles[0].XCoord;
            this.position.Y = tiles[0].YCoord;
        }

        this.initPlayer(self, playerModel);

        $(document).keydown(function (event) {
            self.KeysDown[event.keyCode] = true;

            self.gameHandler.eventHandler.callEvent("PlayerManagerInputCheck", self, null);
        }).keyup(function (event) {
            self.KeysDown[event.keyCode] = false;

            self.lastAction = Date.now();
        });

        this.gameHandler.eventHandler.addTimedTrigger("playerManagerInputCheck", "PlayerManagerInputCheck", 500, this, null);

        this.gameHandler.eventHandler.addEventListener("PlayerManagerInputCheck", function (sender, args) {
            //self.gameHandler.log("Check for Input ...", self.KeysDown);
            if (self.playerState == 0 /* Standing */) {
                if (self.keyDown(self.Keys.up)) {
                    self.initMove(0 /* Up */);
                } else if (self.keyDown(self.Keys.down)) {
                    self.initMove(1 /* Down */);
                } else if (self.keyDown(self.Keys.left)) {
                    self.initMove(2 /* Left */);
                } else if (self.keyDown(self.Keys.right)) {
                    self.initMove(3 /* Right */);
                } else if (self.keyDown(self.Keys.action)) {
                    var now = Date.now();
                    if ((now - self.lastAction) > 300) {
                        self.playerAction();
                    }
                }
            }
        });

        this.gameHandler.eventHandler.addTimedTrigger("playerLastActivityCheck", "PlayerLastActivityCheck", 60000, this, null);

        this.gameHandler.eventHandler.addEventListener("PlayerLastActivityCheck", function (sender, args) {
            var currentTime = Date.now();

            var diff = currentTime - self.lastAction;

            //console.log("CheckDiff: ", diff);
            if (diff > 120000) {
                self.playAnimation("sleep");
            }
        });
    };

    PlayerManager.prototype.getPosition = function () {
        return this.position;
    };

    PlayerManager.prototype.keyDown = function (key) {
        var value = this.KeysDown[key];

        return ((value !== undefined) && (value));
    };

    PlayerManager.prototype.initPlayer = function (self, playerModel) {
        if (typeof playerModel === "undefined") { playerModel = "pichu"; }
        self.gameHandler.loadAnimation("data/animations/pichu.json");
        self.gameHandler.loadAnimation("data/animations/mew.json");
        self.playerAnimation.addAnimation(this.playerElementName, playerModel, "stand", this.position.X, this.position.Y);

        self.gameHandler.eventHandler.callEvent("PlayerPositionChanged", this, this.position);
    };

    PlayerManager.prototype.playerAction = function () {
        var offset = {
            X: this.position.X,
            Y: this.position.Y
        };

        switch (this.moveDirection) {
            case 3 /* Right */:
                offset.X += 1;
                break;

            case 2 /* Left */:
                offset.X += -1 * 1;
                break;

            case 0 /* Up */:
                offset.Y += -1 * 1;
                break;

            case 1 /* Down */:
                offset.Y += 1;
                break;
        }

        this.lastAction = Date.now();

        this.gameHandler.eventHandler.callEvent("PlayerAction", this, offset);
    };

    PlayerManager.prototype.playAnimation = function (name) {
        this.gameHandler.eventHandler.callEvent("playerAnimationChange", this, name);
        this.playerAnimation.playAnimation(this.playerElementName, name);
    };

    PlayerManager.prototype.renderSpeechBubble = function (message, timeout) {
        if (typeof timeout === "undefined") { timeout = 5; }
        var nameTagName = "NPCSpeechBubble-" + this.playerElementName;
        var handler = this.playerAnimation;

        var textLength = 5 * message.length + 15;
        var height = 11;

        var textOffset = 5;

        var position = this.position;

        var offsetX = 0;
        if (textLength > this.gameHandler.config.tileSize) {
            offsetX = (textLength - this.gameHandler.config.tileSize) / 2;
        }

        var Coord = {
            X: (position.X - 1) * this.gameHandler.config.tileSize - offsetX,
            Y: (position.Y - 1.8) * this.gameHandler.config.tileSize
        };

        //console.log(position);
        //console.log(Coord);
        this.DisplaySpeechBubbleTo = Date.now() + timeout * 1000;

        handler.drawColorRect(nameTagName, Coord.X, Coord.Y, textLength, height, 255, 255, 255, 0.3, false);
        handler.writeText(nameTagName + "-text", message, Coord.X + textLength / 2, Coord.Y, "11px sans-serif", "top", "center", "rgba(0,0,0,1)", textLength - 2 * textOffset, false);
    };

    PlayerManager.prototype.removeSpeechBubble = function () {
        var nameTagName = "NPCSpeechBubble-" + this.playerElementName;
        var handler = this.playerAnimation;

        handler.removeGenericDraw(nameTagName);
        handler.removeGenericDraw(nameTagName + "-text");
    };
    return PlayerManager;
})();
