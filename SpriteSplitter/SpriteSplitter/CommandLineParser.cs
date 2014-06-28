using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ArgumentParser.Exceptions;

namespace ArgumentParser
{
    class CommandLineParser
    {
        private enum ParserState
        {
            Command, Argument
        }

        private ConsoleCommand toFill = null;
        private ParserState state = ParserState.Command;


        private Dictionary<string, ConsoleCommand> commands = new Dictionary<string, ConsoleCommand>();

        public ConsoleCommand create(string command, string shortcut)
        {
            if (commands.ContainsKey(command) || ((shortcut != null) && commands.ContainsKey(shortcut)))
            {
                throw new ArgumentException("Command with this name or shortcut allready defined");
            }


            ConsoleCommand com = new ConsoleCommand(command, shortcut);
            commands.Add(command, com);
            if (shortcut != null)
            {
                commands.Add(shortcut, com);
            }

            return com;
        }

        public void register(ConsoleCommand com)
        {
            if (commands.ContainsKey(com.Command) || ((com.Shortcut != null) && commands.ContainsKey(com.Shortcut)))
            {
                throw new ArgumentException("Command with this name or shortcut allready defined");
            }

            commands.Add(com.Command, com);
            if (com.Shortcut != null)
            {
                commands.Add(com.Shortcut, com);
            }
        }


        public void parse(string[] args)
        {
            foreach (string argument in args)
            {

                if ((state == ParserState.Argument) && (toFill != null))
                {
                    if (toFill.NeedsMoreData)
                    {

                        toFill.setValue(argument);
                    }
                    else
                    {
                        state = ParserState.Command;
                    }
                }


                // No Elseif because we check if the current Command needs more data
                // if not, we change the state
                if (state == ParserState.Command)
                {
                    if (commands.ContainsKey(argument))
                    {
                        toFill = commands[argument];
                        state = ParserState.Argument;
                    }
                    else
                    {
                        throw new CommandNotFoundException("The Command " + argument + " could not found!", argument);
                    }

                }
            }


        }


    }
}
