﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WebSocketServer.Models;

namespace WebSocketServer
{
    class UserData
    {
        public Position Position { get; set; }

        public string Animation { get; set; }

        public string AnimationContainer { get; set; }

        public string Username { get; set; }

        public bool IgnoreMessages { get; set; }

        public DateTime LastMessage { get; set; }

        public int Strikes { get; set; }

        public DateTime? LastStrike { get; set; }

    }
}
