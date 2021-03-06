/// <reference path="gameHandler.ts" />

enum MessageType
{
    PlayerJoined, PlayerDisconnected, ConnectionRequest,
    ConnectionResponse, PlayerBeginMove, PlayerPositionChanged,
    PlayerAnimationChanged, PlayerStopMove, PlayerKicked, ChatMessage
}

class MultiplayerHandler
{
    private gameHandler: GameHandler;
    private serverAdress: string;
    private socket: WebSocket;
    private id: string = undefined;

    private username: string = undefined;

    private usernameTable: { [index: string]: string } = {};

    constructor(gameHandler: GameHandler, serverAdress: string, username: string)
    {
        this.gameHandler = gameHandler;
        this.serverAdress = serverAdress;
        this.username = username;

        var self = this;
        this.gameHandler.eventHandler.addEventListener("PlayerPositionChanged", function (s, arg)
        {
            var data =
                {
                    "Type": MessageType[MessageType.PlayerPositionChanged],
                    "ID": self.id,
                    "Position": arg
                };

            self.send(data);

            if (!self.gameHandler.config.hideOwnUsername)
            {
                // Render the Lable above the Player:
                self.renderPlayerLabel(self.username, arg);
            }
        });

        this.gameHandler.eventHandler.addEventListener("playerAnimationChange", function (s, arg)
        {
            var data =
                {
                    "Type": MessageType[MessageType.PlayerAnimationChanged],
                    "ID": self.id,
                    "Animation": arg
                };

            self.send(data);
        });

        this.gameHandler.eventHandler.addEventListener("PlayerStartMoving", function (s, arg)
        {
            var data =
                {
                    "Type": MessageType[MessageType.PlayerBeginMove],
                    "ID": self.id,
                    "Position": arg.Position,
                    "Target": arg.Target,
                    "Direction": arg.Direction,
                    "Speed": arg.Speed
                };

            self.send(data);

        });

        this.gameHandler.eventHandler.addEventListener("PlayerStopMoving", function (s, arg)
        {
            var data =
                {
                    "Type": MessageType[MessageType.PlayerStopMove],
                    "ID": self.id
                };

            self.send(data);
        });

    }

    public init()
    {


    }


    public connect()
    {
        this.socket = new WebSocket(this.serverAdress);

        var self = this;


        this.socket.onopen = function ()
        {
            var data = {
                "Type": "ConnectionRequest",
                "Position": self.gameHandler.playerManager.getPosition(),
                "AnimationContainer": self.gameHandler.config.playerModel,
                "Animation": "stand",
                "Username": self.username

            };

            self.send(data, true);

        };


        this.socket.onmessage = function (e)
        {
            var data = JSON.parse(e.data);

            //self.gameHandler.log("WebSocket: ", data);

            if ((data !== undefined) && (data !== null) && (typeof (data) === "object"))
            {
                if (data.Type !== undefined)
                {
                    try
                    {
                        var type = MessageType[<string>data.Type];

                        if (type !== null)
                        {

                            switch (type)
                            {
                                case MessageType.PlayerJoined:

                                    self.gameHandler.npcManager.addNPC(data.ID, data.Position, data.AnimationContainer, data.Animation);

                                    self.usernameTable[data.ID] = data.Username;

                                    self.renderPlayerLabel(data.Username, data.Position);

                                    break;

                                case MessageType.PlayerBeginMove:

                                    //self.gameHandler.npcManager.advInitMove(data.ID, data.Position, data.Direction, data.Speed, undefined, true);

                                    break;

                                case MessageType.PlayerPositionChanged:

                                    self.gameHandler.npcManager.setPosition(data.ID, data.Position);
                                    self.renderPlayerLabel(self.usernameTable[data.ID], data.Position);

                                    break;

                                case MessageType.PlayerAnimationChanged:

                                    self.gameHandler.npcManager.setAnimation(data.ID, data.Animation);

                                    break;

                                case MessageType.PlayerStopMove:

                                    self.gameHandler.npcManager.NPCMotionStop(data.ID);
                                    break;

                                case MessageType.ConnectionResponse:

                                    self.id = data.ID;
                                    self.username = data.Username;

                                    if (!self.gameHandler.config.hideOwnUsername)
                                    {
                                        // Render the Lable above the Player:
                                        self.renderPlayerLabel(self.username, self.gameHandler.playerManager.getPosition());
                                    }

                                    break;

                                case MessageType.PlayerDisconnected:

                                    self.gameHandler.npcManager.removeNPC(data.ID);
                                    self.removePlayerLabel(self.usernameTable[data.ID]);
                                    delete self.usernameTable[data.ID];

                                    break;

                                case MessageType.ChatMessage:

                                    console.log("Chat - " + data.ID + ": " + data.Message);
                                    self.gameHandler.npcManager.renderSpeechBubble(data.ID, data.Message);

                                    break;

                                case MessageType.PlayerKicked:

                                    alert("You have been kicked from the Server! Reason: " + data.Reason);
                                    self.id = undefined;

                                    break;

                            }
                        }
                        else
                        {
                            self.gameHandler.error("Unknown Message Type on Socket: ", data.Type, data);
                        }

                    } catch (ex)
                    {
                        self.gameHandler.error("Error parsing Socket Message: ", ex, data);

                    }
                }
                else
                {
                    self.gameHandler.error("No Type Attribute on Socket Message:", data);
                }

            }

        };

    }

    public sendChatMessage(message: string)
    {
        this.gameHandler.playerManager.renderSpeechBubble(message);

        var data = {
            ID: this.id,
            Message: message,
            Type: "ChatMessage"
        };

        this.send(data);
    }


    private renderPlayerLabel(name: string, position: Coordinate)
    {
        var nameTagName = "PlayerNameTag-" + name;
        var handler = this.gameHandler.topAnimationHandler;

        var textLength = 5 * name.length + 15; // 60
        var height = 11;

        var textOffset = 5;

        /*
        var Coord = {
            X: position.X * this.gameHandler.config.tileSize - 45,
            Y: (position.Y - 1.6) * this.gameHandler.config.tileSize
        };
*/

        var offsetX = 0;
        if (textLength > this.gameHandler.config.tileSize)
        {
            offsetX = (textLength - this.gameHandler.config.tileSize) / 2;
        }

        var coord = {
            X: (position.X - 1) * this.gameHandler.config.tileSize - offsetX,
            Y: (position.Y - 1.4) * this.gameHandler.config.tileSize
        };


        handler.drawColorRect(nameTagName, coord.X, coord.Y, textLength, height, 255, 255, 255, 0.3, false);
        handler.writeText(nameTagName + "-text", name, coord.X + textLength / 2, coord.Y, "11px sans-serif", "top", "center", "rgba(0,0,0,1)", textLength - 2 * textOffset, false);


    }

    private removePlayerLabel(name: string)
    {
        var nameTagName = "PlayerNameTag-" + name;
        var handler = this.gameHandler.topAnimationHandler;

        handler.removeGenericDraw(nameTagName);
        handler.removeGenericDraw(nameTagName + "-text");
    }


    private send(data: any, ignoreCheck: boolean = false)
    {
        if (ignoreCheck || (this.id !== undefined))
        {
            var text = JSON.stringify(data);
            this.socket.send(text);
        }
    }
}

