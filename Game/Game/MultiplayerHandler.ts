/// <reference path="gameHandler.ts" />

enum MessageType
{
    PlayerJoined, PlayerDisconnected, ConnectionRequest, ConnectionResponse, PlayerBeginMove, PlayerPositionChanged, PlayerAnimationChanged, PlayerStopMove
}

class MultiplayerHandler
{
    private gameHandler: GameHandler;
    private serverAdress: string;
    private socket: WebSocket;
    private id: string = undefined;

    // --- Change that ...
    private npcName: string = undefined;

    constructor(gameHandler: GameHandler, serverAdress: string)
    {
        this.gameHandler = gameHandler;
        this.serverAdress = serverAdress;

        var self = this;
        this.gameHandler.eventHandler.addEventListener("PlayerPositionChanged", function (s, arg)
        {
            var data =
                {
                    "Type": MessageType[MessageType.PlayerPositionChanged],
                    "ID": self.id,
                    "Position": arg
                }

            self.send(data);
        });

        this.gameHandler.eventHandler.addEventListener("playerAnimationChange", function (s, arg)
        {
            var data =
                {
                    "Type": MessageType[MessageType.PlayerAnimationChanged],
                    "ID": self.id,
                    "Animation": arg
                }

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
                }

            self.send(data);

        });

        this.gameHandler.eventHandler.addEventListener("PlayerStopMoving", function (s, arg)
        {
            var data =
                {
                    "Type": MessageType[MessageType.PlayerStopMove],
                    "ID": self.id
                }

            self.send(data);
        });

    }

    public init()
    {


    }

    private join()
    {
        var data =
            {
                "Type": MessageType[MessageType.PlayerJoined],
                "ID": this.id,
                "Position": this.gameHandler.playerManager.getPosition()
            };


        this.send(data);
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
                "AnimationContainer": "pichu",
                "Animation": "stand"

            };

            self.send(data, true);

        }


        this.socket.onmessage = function (e)
        {
            var data = JSON.parse(e.data);

            //self.gameHandler.log("WebSocket: ", data);

            if ((data !== undefined) && (data != null) && (typeof (data) == "object"))
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

                                    break;

                                case MessageType.PlayerBeginMove:

                                    self.gameHandler.npcManager.advInitMove(data.ID, data.Position, data.Direction, data.Speed, undefined, true);

                                    break;

                                case MessageType.PlayerPositionChanged:

                                    self.gameHandler.npcManager.setPosition(data.ID, data.Position);

                                    break;

                                case MessageType.PlayerAnimationChanged:

                                    self.gameHandler.npcManager.setAnimation(data.ID, data.Animation);

                                    break;

                                case MessageType.PlayerStopMove:

                                    self.gameHandler.npcManager.NPCMotionStop(data.ID);
                                    break;

                                case MessageType.ConnectionResponse:

                                    self.id = data.ID;

                                    break;

                                case MessageType.PlayerDisconnected:

                                    self.gameHandler.npcManager.removeNPC(data.ID);

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
