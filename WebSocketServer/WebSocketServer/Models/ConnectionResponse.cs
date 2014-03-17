using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WebSocketServer.Models
{
    class ConnectionResponse: BaseCommand
    {
        public ConnectionResponse()
            : base("ConnectionResponse")
        {
        }
    }
}
