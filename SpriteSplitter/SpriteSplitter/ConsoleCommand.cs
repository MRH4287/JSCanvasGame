using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ArgumentParser
{
    class ConsoleCommand
    {
        protected string command;
        protected string shortcut;

        private string value = null;

        public ConsoleCommand(string command, string shortcut = null)
        {
            this.command = command;
            this.shortcut = shortcut;
        }

        public string Command
        {
            get
            {
                return command;
            }
        }


        public string Shortcut
        {
            get
            {
                return shortcut;
            }
        }

        public virtual bool NeedsMoreData
        {
            get
            {
                return (value == null);
            }
        }

        public virtual string Value
        {
            get
            {
                return value;
            }
        }

        public virtual bool HasValue
        {
            get
            {
                return (value != null);
            }
        }



        public virtual void setValue(string input)
        {
            this.value = input;
        }


    }
}
