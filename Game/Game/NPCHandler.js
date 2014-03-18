/// <reference path="gameHandler.ts" />
var NPCHandler = (function () {
    function NPCHandler(gameHandler, animationHandler) {
        this.npcList = {};
        this.updatesPerSecond = 10;
        this.gameHandler = gameHandler;
        this.animation = animationHandler;

        var self = this;

        this.gameHandler.eventHandler.addEventListener("CheckIsPassable", function (s, argument) {
            // Check if an NPC is standing on this position
            $.each(self.npcList, function (id, data) {
                if ((data.Position.X == argument.X) && (data.Position.Y == argument.Y)) {
                    argument.result = false;
                }
            });
        });

        this.gameHandler.eventHandler.addEventListener("PlayerAction", function (s, argument) {
            $.each(self.npcList, function (id, data) {
                if ((data.Position.X == argument.X) && (data.Position.Y == argument.Y)) {
                    self.gameHandler.eventHandler.callEvent("PlayerNPCAction", self, {
                        name: id,
                        X: argument.X,
                        Y: argument.Y
                    });
                }
            });
        });

        self.gameHandler.eventHandler.callEvent("TaskCreated", self, "NPC - Constructor");
        window.setTimeout(function () {
            self.gameHandler.eventHandler.callEvent("npcInit", self, null);

            self.gameHandler.eventHandler.callEvent("TaskDisposed", self, "NPC - Constructor");
        }, 100);
    }
    NPCHandler.prototype.addNPC = function (name, position, animationContainer, defaultAnimation, speed) {
        if (typeof speed === "undefined") { speed = 1; }
        // Add new NPC to System:
        var data = {
            ID: name,
            Position: position,
            Target: position,
            GUID: "NPC-Animation-" + String(Math.random() * Math.random() * 10000),
            Direction: 4 /* None */,
            Speed: speed,
            State: 0 /* Standing */
        };

        this.npcList[name] = data;

        // Start default Animation for Element:
        this.animation.addAnimation(data.GUID, animationContainer, defaultAnimation, position.X, position.Y);
    };

    NPCHandler.prototype.removeNPC = function (name) {
        if (this.npcList[name] === undefined) {
            this.gameHandler.error("No NPC with this ID found!", name);
            return;
        }

        this.animation.stopAnimation(this.npcList[name].GUID);
        delete this.npcList[name];
    };

    NPCHandler.prototype.setAnimation = function (name, animationName) {
        if (this.npcList[name] === undefined) {
            this.gameHandler.error("No NPC with this ID found!", name);
            return;
        }

        this.animation.playAnimation(this.npcList[name].GUID, animationName);
    };

    NPCHandler.prototype.setPosition = function (name, position, rerender) {
        if (typeof rerender === "undefined") { rerender = true; }
        if (this.npcList[name] === undefined) {
            this.gameHandler.error("No NPC with this ID found!", name);
            return;
        }

        this.npcList[name].Position = position;
        this.animation.setPosition(this.npcList[name].GUID, position.X, position.Y, rerender);
    };

    NPCHandler.prototype.NPCMotionStop = function (name) {
        if (this.npcList[name] === undefined) {
            this.gameHandler.error("No NPC with this ID found!", name);
            return;
        }

        this.npcList[name].State = 0 /* Standing */;
    };

    NPCHandler.prototype.advInitMove = function (name, position, direction, speed, callback, ignoreChecks) {
        if (typeof ignoreChecks === "undefined") { ignoreChecks = false; }
        var npc = this.npcList[name];

        if ((npc.State == 1 /* Walking */) && (!ignoreChecks)) {
            this.gameHandler.log("NPC is already walking", npc);
            return;
        }

        this.setPosition(name, position);
        npc.Speed = speed;
        this.initMove(name, direction, callback, ignoreChecks);
    };

    NPCHandler.prototype.initMove = function (name, direction, callback, ignoreChecks) {
        if (typeof ignoreChecks === "undefined") { ignoreChecks = false; }
        if (this.npcList[name] === undefined) {
            this.gameHandler.error("No NPC with this ID found!", name);
            return;
        }

        var npc = this.npcList[name];

        if ((npc.State == 1 /* Walking */) && (!ignoreChecks)) {
            this.gameHandler.log("NPC is already walking", npc);
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

        this.animation.playAnimation(npc.GUID, idleAnimation);

        var target = {
            X: npc.Position.X + walkOffset.X,
            Y: npc.Position.Y + walkOffset.Y
        };

        //this.gameHandler.log("Want to move to: ", target);
        //this.gameHandler.log("Play Animation: ", animation);
        if (this.gameHandler.isCoordPassable(target.X, target.Y)) {
            var offsetPerUpdate = (1 / npc.Speed) / this.updatesPerSecond;
            var intervall = (1 / this.updatesPerSecond) * 1000;

            npc.Target = target;
            npc.Direction = direction;

            npc.State = 1 /* Walking */;

            // Start Animation:
            this.animation.playAnimation(npc.GUID, animation);

            var self = this;
            this.positionUpdateStep(npc, direction, offsetPerUpdate, intervall, function () {
                self.moveFinishedCallback(npc);

                if (callback !== undefined) {
                    callback();
                }
            });
        } else {
            this.gameHandler.log("Target not passable: ", target);
            npc.State = 0 /* Standing */;
        }
    };

    /* Movement Handler */
    NPCHandler.prototype.moveFinishedCallback = function (npc) {
        var animation = "stand";

        switch (npc.Direction) {
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

        this.animation.playAnimation(npc.GUID, animation);
        npc.State = 0 /* Standing */;
    };

    NPCHandler.prototype.positionUpdateStep = function (npc, direction, offsetPerUpdate, intervall, callback) {
        if (npc.State == 0 /* Standing */) {
            return;
        }

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
            X: npc.Position.X + walkOffset.X,
            Y: npc.Position.Y + walkOffset.Y
        };

        var normalizedPosition = {
            X: Math.round(newPosition.X),
            Y: Math.round(newPosition.Y)
        };

        if ((((direction == 3 /* Right */) && (newPosition.X > npc.Target.X)) || ((direction == 2 /* Left */) && (newPosition.X < npc.Target.X)) || ((direction == 0 /* Up */) && (newPosition.Y < npc.Target.Y)) || ((direction == 1 /* Down */) && (newPosition.Y > npc.Target.Y)))) {
            this.setPosition(npc.ID, normalizedPosition);

            //self.gameHandler.eventHandler.callEvent("PlayerPositionChanged", this, normalizedPosition);
            //console.log("Movement done!");
            if (callback !== undefined) {
                callback(npc);
            }
        } else {
            this.setPosition(npc.ID, newPosition);

            //console.log("Position updated: ", newPosition);
            var self = this;

            self.gameHandler.eventHandler.callEvent("TaskCreated", self, "NPC - PlayerPositonUpdateStep");
            window.setTimeout(function () {
                self.positionUpdateStep(npc, direction, offsetPerUpdate, intervall, callback);

                self.gameHandler.eventHandler.callEvent("TaskDisposed", self, "NPC - PlayerPositonUpdateStep");
            }, intervall);
        }
    };
    return NPCHandler;
})();
