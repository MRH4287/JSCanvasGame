using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ArgumentParser
{
    class StringListConsoleCommand : ConsoleCommand
    {
        private int maxElements;

        private LinkedList<string> values = new LinkedList<string>();


        public LinkedList<string> ValueStringList
        {
            get
            {
                return values;
            }
        }

        public StringListConsoleCommand(string command, string shortcut = null, int maxElements = 2)
            : base(command, shortcut)
        {
            if (maxElements < 2)
            {
                throw new ArgumentException("maxElements must greather or equals 2");
            }

            this.maxElements = maxElements;

        }

        public override bool HasValue
        {
            get
            {
                return (values.Count > 0);
            }
        }

        public override bool NeedsMoreData
        {
            get
            {
                return (values.Count < maxElements);
            }
        }

        public override void setValue(string input)
        {
            values.AddLast(input);

            base.setValue(input);
        }

    }
}
