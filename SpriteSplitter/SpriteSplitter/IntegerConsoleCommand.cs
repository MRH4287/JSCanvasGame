using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ArgumentParser
{
    class IntegerConsoleCommand : ConsoleCommand
    {
        public IntegerConsoleCommand(string command, string shortcut = null)
            : base(command, shortcut)
        {

        }

        private int? value = null;

        public int ValueInt
        {
            get
            {
                return value.Value;
            }

        }

        public override bool HasValue
        {
            get
            {
                return value.HasValue;
            }
        }

        public override bool NeedsMoreData
        {
            get
            {
                return !HasValue;
            }
        }

        public override void setValue(string input)
        {
            this.value = int.Parse(input);

            base.setValue(input);
        }
    }
}
