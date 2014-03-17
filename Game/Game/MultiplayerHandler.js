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
    function MultiplayerHandler(gameHandler, serverAdress) {
        this.id = undefined;
        // --- Change that ...
        this.npcName = undefined;
        this.gameHandler = gameHandler;
        this.serverAdress = serverAdress;

        var self = this;
        this.gameHandler.eventHandler.addEventListener("PlayerPositionChanged", function (s, arg) {
            var data = {
                "Type": MessageType[5 /* PlayerPositionChanged */],
                "ID": self.id,
                "Position": arg
            };

            self.send(data);
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

    MultiplayerHandler.prototype.join = function () {
        var data = {
            "Type": MessageType[0 /* PlayerJoined */],
            "ID": this.id,
            "Position": this.gameHandler.playerManager.getPosition()
        };

        this.send(data);
    };

    MultiplayerHandler.prototype.connect = function () {
        this.socket = new WebSocket(this.serverAdress);

        var self = this;

        this.socket.onopen = function () {
            var data = {
                "Type": "ConnectionRequest",
                "Position": self.gameHandler.playerManager.getPosition(),
                "AnimationContainer": "pichu",
                "Animation": "stand"
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

                                    break;

                                case 4 /* PlayerBeginMove */:
                                    self.gameHandler.npcManager.advInitMove(data.ID, data.Position, data.Direction, data.Speed, undefined, true);

                                    break;

                                case 5 /* PlayerPositionChanged */:
                                    self.gameHandler.npcManager.setPosition(data.ID, data.Position);

                                    break;

                                case 6 /* PlayerAnimationChanged */:
                                    self.gameHandler.npcManager.setAnimation(data.ID, data.Animation);

                                    break;

                                case 7 /* PlayerStopMove */:
                                    self.gameHandler.npcManager.NPCMotionStop(data.ID);
                                    break;

                                case 3 /* ConnectionResponse */:
                                    self.id = data.ID;

                                    break;

                                case 1 /* PlayerDisconnected */:
                                    self.gameHandler.npcManager.removeNPC(data.ID);

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

    MultiplayerHandler.prototype.send = function (data, ignoreCheck) {
        if (typeof ignoreCheck === "undefined") { ignoreCheck = false; }
        if (ignoreCheck || (this.id !== undefined)) {
            var text = JSON.stringify(data);
            this.socket.send(text);
        }
    };
    return MultiplayerHandler;
})();
