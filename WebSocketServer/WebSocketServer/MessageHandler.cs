using Fleck;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NLog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WebSocketServer.Models;

namespace WebSocketServer
{
    class MessageHandler
    {
        enum MessageType
        {
            PlayerJoined, PlayerDisconnected, ConnectionRequest, ConnectionResponse, PlayerBeginMove, PlayerPositionChanged, PlayerAnimationChanged, PlayerStopMove
        }

        private static Logger logger = LogManager.GetCurrentClassLogger();

        private Fleck.WebSocketServer server;

        private LinkedList<IWebSocketConnection> connections = new LinkedList<IWebSocketConnection>();
        private Dictionary<Guid, int> userIDTable = new Dictionary<Guid, int>();

        private Dictionary<int, UserData> userData = new Dictionary<int, UserData>();



        public MessageHandler(string address = "ws://localhost:8181")
        {
            server = new Fleck.WebSocketServer(address);

            server.Start(socket =>
            {
                socket.OnOpen = () =>
                {
                    logger.Info("New Connection");
                    this.connections.AddLast(socket);

                };
                socket.OnClose = () =>
                {
                    logger.Info("Connection closed:", socket.ConnectionInfo.ClientIpAddress);

                    if (this.connections.Any(el => el.ConnectionInfo.Id == socket.ConnectionInfo.Id))
                    {
                        // Delete all user specific Data:
                        if (this.userIDTable.ContainsKey(socket.ConnectionInfo.Id))
                        {
                            var id = this.userIDTable[socket.ConnectionInfo.Id];

                            this.userData.Remove(id);
                            this.userIDTable.Remove(socket.ConnectionInfo.Id);

                            var data = new PlayerDisconnected()
                            {
                                ID = id.ToString()
                            };

                            // Send all users the Disconnect Message:
                            this.sendToAll(data, socket);

                        }

                        this.connections.Remove(this.connections.Where(el => el.ConnectionInfo.Id == socket.ConnectionInfo.Id).Single());
                    }


                };
                socket.OnMessage = message =>
                {
                    logger.Trace(String.Format("{0}: {1}", socket.ConnectionInfo.ClientIpAddress, message));

                    this.handleMessage(socket, message);

                };

            });

        }


        private void handleMessage(IWebSocketConnection origin, string message)
        {
            try
            {

                dynamic element = JObject.Parse(message);

                MessageType type = (MessageType)Enum.Parse(typeof(MessageType), (string)element.Type);

                switch (type)
                {
                    case MessageType.PlayerJoined:
                    case MessageType.PlayerDisconnected:
                        logger.Warn("Received Message that should only sent by the Server. Ignore!");
                        break;

                    case MessageType.ConnectionRequest:

                        logger.Info("New Connection Request: ", origin.ConnectionInfo.ClientIpAddress);

                        var id = 0;
                        if (this.userIDTable.Count > 0)
                        {
                            id = this.userIDTable.Max(el => el.Value) + 1;
                        }

                        var response = new ConnectionResponse()
                        {
                            ID = id.ToString()
                        };

                        this.userIDTable[origin.ConnectionInfo.Id] = id;
                        this.userData[id] = new UserData()
                        {
                            Animation = element.Animation,
                            AnimationContainer = element.AnimationContainer,
                            Position = new Position()
                            {
                                X = element.Position.X,
                                Y = element.Position.Y
                            }

                        };

                        this.send(response, origin);  

                        // Send Join Message to every other User:

                        var join = new JoinCommand()
                        {
                            ID = id.ToString(),
                            Position = new Position()
                            {
                                X = element.Position.X,
                                Y = element.Position.Y
                            },
                            AnimationContainer = element.AnimationContainer,
                            Animation = element.Animation

                        };

                        sendToAll(join, origin);

                        // Send the Message of all current Active Users to the Client:

                        foreach (var user in this.userData)
                        {
                            if (user.Key != id)
                            {
                                var data = new JoinCommand()
                                {
                                    Animation = user.Value.Animation,
                                    AnimationContainer = user.Value.AnimationContainer,
                                    ID = user.Key.ToString(),
                                    Position = user.Value.Position

                                };

                                this.send(data, origin);

                            }


                        }


                        break;
                    case MessageType.PlayerBeginMove:
                    case MessageType.PlayerPositionChanged:
                    case MessageType.PlayerAnimationChanged:
                    case MessageType.PlayerStopMove:

                        if (this.userIDTable.ContainsKey(origin.ConnectionInfo.Id))
                        {
                            if (this.userIDTable[origin.ConnectionInfo.Id].ToString() == ((string)element.ID))
                            { 
                                // Relay this Message to the other Clients:
                                this.sendToAll(message, origin);
                            }
                            else
                            {
                                logger.Warn("The sent and the saved ID do not match!");
                            }

                        }
                        else
                        {
                            logger.Info("Message recieved before a Connection Request was made. Ignore Message.");
                        }

                        // Log data internaly:
                        var userID = this.userIDTable[origin.ConnectionInfo.Id];

                        if (type == MessageType.PlayerPositionChanged)
                        {
                            this.userData[userID].Position.X = element.Position.X;
                            this.userData[userID].Position.Y = element.Position.Y;

                        }
                        else if (type == MessageType.PlayerAnimationChanged)
                        {
                            this.userData[userID].Animation = element.Animation;
                        }


                        break;
                    default:
                        break;
                }



            } 
            catch (Exception ex)
            {
                logger.Warn("Can't parse Message: {0}", ex);
            }
        }


        private void send(object element, IWebSocketConnection target)
        {
            var text = JsonConvert.SerializeObject(element);
            target.Send(text);

            logger.Trace(String.Format("To Client {0}: {1}", 
                ((this.userIDTable.ContainsKey(target.ConnectionInfo.Id))
                ? this.userIDTable[target.ConnectionInfo.Id].ToString() : target.ConnectionInfo.Id.ToString()), text));
        }

        private void sendToAll(object element, IWebSocketConnection origin = null)
        {
            var text = JsonConvert.SerializeObject(element);
            this.sendToAll(text, origin);

            logger.Trace(String.Format("To All: {0}", text));
        }

        private void sendToAll(string message, IWebSocketConnection origin = null)
        {

            foreach (var connection in connections)
            {
                if ((origin != null) && (connection.ConnectionInfo.Id == origin.ConnectionInfo.Id))
                {
                    continue;
                }
                connection.Send(message);
            }


        }


    }
}
