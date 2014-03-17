/// <reference path="gameHandler.ts" />
var MessageType;
(function (MessageType) {
    MessageType[MessageType["PlayerJoined"] = 0] = "PlayerJoined";
    MessageType[MessageType["PlayerDisconnected"] = 1] = "PlayerDisconnected";
    MessageType[MessageType["ConnectionRequest"] = 2] = "ConnectionRequest";
    MessageType[MessageType["ConnectionResponse"] = 3] = "ConnectionResponse";
    MessageType[MessageType["PlayerBeginMove"] = 4] = "PlayerBeginMove";
    MessageType[MessageType["PlayerPositionChanged"] = 5] = "PlayerPositionChanged";
    MessageType[MessageType["PlayerAnimationChanged"] = 6] = "PlayerAnimationChanged";
    MessageType[MessageType["PlayerStopMove"] = 7] = "PlayerStopMove";
})(MessageType || (MessageType = {}));

var MultiplayerHandler = (function () {
    function MultiplayerHandler(gameHandler, serverAdress, username) {
        this.id = undefined;
        this.username = undefined;
        this.usernameTable = {};
        this.gameHandler = gameHandler;
        this.serverAdress = serverAdress;
        this.username = username;

        var self = this;
        this.gameHandler.eventHandler.addEventListener("PlayerPositionChanged", function (s, arg) {
            var data = {
                "Type": MessageType[5 /* PlayerPositionChanged */],
                "ID": self.id,
                "Position": arg
            };

            self.send(data);

            if (!self.gameHandler.config.hideOwnUsername) {
                // Render the Lable above the Player:
                self.renderPlayerLabel(self.username, arg);
            }
        });

        this.gameHandler.eventHandler.addEventListener("playerAnimationChange", function (s, arg) {
            var data = {
                "Type": MessageType[6 /* PlayerAnimationChanged */],
                "ID": self.id,
                "Animation": arg
            };

            self.send(data);
        });

        this.gameHandler.eventHandler.addEventListener("PlayerStartMoving", function (s, arg) {
            var data = {
                "Type": MessageType[4 /* PlayerBeginMove */],
                "ID": self.id,
                "Position": arg.Position,
                "Target": arg.Target,
                "Direction": arg.Direction,
                "Speed": arg.Speed
            };

            self.send(data);
        });

        this.gameHandler.eventHandler.addEventListener("PlayerStopMoving", function (s, arg) {
            var data = {
                "Type": MessageType[7 /* PlayerStopMove */],
                "ID": self.id
            };

            self.send(data);
        });
    }
    MultiplayerHandler.prototype.init = function () {
    };

    MultiplayerHandler.prototype.connect = function () {
        this.socket = new WebSocket(this.serverAdress);

        var self = this;

        this.socket.onopen = function () {
            var data = {
                "Type": "ConnectionRequest",
                "Position": self.gameHandler.playerManager.getPosition(),
                "AnimationContainer": "pichu",
                "Animation": "stand",
                "Username": self.username
            };

            self.send(data, true);
        };

        this.socket.onmessage = function (e) {
            var data = JSON.parse(e.data);

            //self.gameHandler.log("WebSocket: ", data);
            if ((data !== undefined) && (data != null) && (typeof (data) == "object")) {
                if (data.Type !== undefined) {
                    try  {
                        var type = MessageType[data.Type];

                        if (type !== null) {
                            switch (type) {
                                case 0 /* PlayerJoined */:
                                    self.gameHandler.npcManager.addNPC(data.ID, data.Position, data.AnimationContainer, data.Animation);

                                    self.usernameTable[data.ID] = data.Username;

                                    self.renderPlayerLabel(data.Username, data.Position);

                                    break;

                                case 4 /* PlayerBeginMove */:
                                    self.gameHandler.npcManager.advInitMove(data.ID, data.Position, data.Direction, data.Speed, undefined, true);

                                    break;

                                case 5 /* PlayerPositionChanged */:
                                    self.gameHandler.npcManager.setPosition(data.ID, data.Position);
                                    self.renderPlayerLabel(self.usernameTable[data.ID], data.Position);

                                    break;

                                case 6 /* PlayerAnimationChanged */:
                                    self.gameHandler.npcManager.setAnimation(data.ID, data.Animation);

                                    break;

                                case 7 /* PlayerStopMove */:
                                    self.gameHandler.npcManager.NPCMotionStop(data.ID);
                                    break;

                                case 3 /* ConnectionResponse */:
                                    self.id = data.ID;
                                    self.username = data.Username;

                                    if (!self.gameHandler.config.hideOwnUsername) {
                                        // Render the Lable above the Player:
                                        self.renderPlayerLabel(self.username, self.gameHandler.playerManager.getPosition());
                                    }

                                    break;

                                case 1 /* PlayerDisconnected */:
                                    self.gameHandler.npcManager.removeNPC(data.ID);
                                    self.removePlayerLabel(self.usernameTable[data.ID]);
                                    delete self.usernameTable[data.ID];

                                    break;
                            }
                        } else {
                            self.gameHandler.error("Unknown Message Type on Socket: ", data.Type, data);
                        }
                    } catch (ex) {
                        self.gameHandler.error("Error parsing Socket Message: ", ex, data);
                    }
                } else {
                    self.gameHandler.error("No Type Attribute on Socket Message:", data);
                }
            }
            /*
            if (data.X !== undefined)
            {
            if (self.npcName === undefined)
            {
            self.gameHandler.npcManager.addNPC("bla", data, "pichu", "stand");
            self.npcName = "bla";
            }
            else
            {
            self.gameHandler.npcManager.setPosition("bla", data);
            }
            }
            else if (data.Animation !== undefined)
            {
            self.gameHandler.npcManager.setAnimation("bla", data.Animation);
            }
            
            */
        };
    };

    MultiplayerHandler.prototype.renderPlayerLabel = function (name, position) {
        var nameTagName = "PlayerNameTag-" + name;
        var handler = this.gameHandler.topAnimationHandler;

        var textLength = 60;
        var height = 11;

        var textOffset = 5;

        var Coord = {
            X: position.X * this.gameHandler.config.tileSize - 45,
            Y: (position.Y - 1.6) * this.gameHandler.config.tileSize
        };

        handler.drawColorRect(nameTagName, Coord.X, Coord.Y, textLength, height, 255, 255, 255, 0.3, false);
        handler.writeText(nameTagName + "-text", name, Coord.X + textLength / 2, Coord.Y, "11px sans-serif", "top", "center", "rgba(0,0,0,1)", textLength - 2 * textOffset, false);
    };

    MultiplayerHandler.prototype.removePlayerLabel = function (name) {
        var nameTagName = "PlayerNameTag-" + name;
        var handler = this.gameHandler.topAnimationHandler;

        handler.removeGenericDraw(nameTagName);
        handler.removeGenericDraw(nameTagName + "-text");
    };

    MultiplayerHandler.prototype.send = function (data, ignoreCheck) {
        if (typeof ignoreCheck === "undefined") { ignoreCheck = false; }
        if (ignoreCheck || (this.id !== undefined)) {
            var text = JSON.stringify(data);
            this.socket.send(text);
        }
    };
    return MultiplayerHandler;
})();
