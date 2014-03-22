using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WebSocketServer.Models
{
    class PlayerKicked : BaseCommand
    {
        public PlayerKicked()
            : base("PlayerKicked")
        {

        }

        public string Reason { get; set; }

    }
}
