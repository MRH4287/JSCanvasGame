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
        public double X { get; set; }
        public double Y { get; set; }

        public double Distance
        {
            get
            {
                return Math.Sqrt(Math.Pow(X, 2) + Math.Pow(Y, 2));
            }
        }


        public static Position operator -(Position value1, Position value2)
        {
            return new Position()
            {
                X = value1.X - value2.X,
                Y = value1.Y - value2.Y
            };
        }


        public static Position operator +(Position value1, Position value2)
        {
            return new Position()
            {
                X = value1.X + value2.X,
                Y = value1.Y + value2.Y
            };
        }

        public void Normalize()
        {
            X = Math.Abs(X);
            Y = Math.Abs(Y);

        }

    }
}
