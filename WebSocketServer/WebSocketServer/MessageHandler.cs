using Fleck;
using NLog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WebSocketServer
{
    class MessageHandler
    {
        private static Logger logger = LogManager.GetCurrentClassLogger();

        private Fleck.WebSocketServer server;

        private Dictionary<Guid, IWebSocketConnection> connections = new Dictionary<Guid, IWebSocketConnection>();


        public MessageHandler(string address = "ws://localhost:8181")
        {
            server = new Fleck.WebSocketServer(address);

            server.Start(socket =>
            {
                socket.OnOpen = () =>
                {
                    logger.Info("New Connection from Client:", socket.ConnectionInfo.Id.ToString());
                    this.connections[socket.ConnectionInfo.Id] = socket;
                    
                };
                socket.OnClose = () =>
                {
                    logger.Info("Connection closed:", socket.ConnectionInfo.Id.ToString());
                    if (this.connections.ContainsKey(socket.ConnectionInfo.Id))
                    {
                        this.connections.Remove(socket.ConnectionInfo.Id);
                    }

                };
                socket.OnMessage = message =>
                {
                    logger.Info(String.Format("{0}: {1}", socket.ConnectionInfo.Id.ToString(), message) );

                    foreach (var connection in connections)
                    {
                        connection.Value.Send(message);
                    }

                };
                
            });

        }

    }
}
