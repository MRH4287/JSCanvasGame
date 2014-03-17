using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WebSocketServer.Models
{
    abstract class BaseCommand
    {
        protected string _type = "";

        public string Type
        {
            get { return _type; }
            set { _type = value; }
        }
        public string ID { get; set; }

        public BaseCommand(string type)
        {
            this._type = type;
        }

    }

    class Position
    {
        public int X { get; set; }
        public int Y { get; set; }
    }
}
