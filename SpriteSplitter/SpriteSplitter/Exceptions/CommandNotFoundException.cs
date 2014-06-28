using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ArgumentParser.Exceptions
{
    class CommandNotFoundException : Exception
    {
        private string command;

        public string Command
        {
            get
            {
                return command;
            }
        }

        public CommandNotFoundException(string message, string command)
            : base(message)
        {
            this.command = command;
        }
    }
}
