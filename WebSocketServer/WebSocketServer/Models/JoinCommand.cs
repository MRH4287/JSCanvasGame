using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WebSocketServer.Models
{
    class JoinCommand : BaseCommand
    {
        public JoinCommand()
            : base("PlayerJoined")
        {
        }

        public Position Position { get; set; }

        public string AnimationContainer { get; set; }
        public string Animation { get; set; }

    }


}
