/// <reference path="gameHandler.ts" />

enum ElementTypes
{
    Unknown, OnEvent, SetVariable, If, Command, Event, Sound,
    Variable,
    Increment, Decrement, Add, Sub, Mult, Div,
    Gt, Lt, Eq, Neq, GtE, LtE,
    And, Nand, Or, Nor, Not,
    Tile

}

class ScriptHandler
{
    private gameHandler: GameHandler;

    private typeShortcuts: { [index: string]: ElementTypes } = {
        ">": ElementTypes.Gt,
        "<": ElementTypes.Lt,
        "==": ElementTypes.Eq,
        "!=": ElementTypes.Neq,
        ">=": ElementTypes.GtE,
        "<=": ElementTypes.LtE,
        "&": ElementTypes.And,
        "&&": ElementTypes.And,
        "|": ElementTypes.Or,
        "||": ElementTypes.Or,
        "!": ElementTypes.Not,
        "+": ElementTypes.Add,
        "-": ElementTypes.Sub,
        "*": ElementTypes.Mult,
        "/": ElementTypes.Div
    }



    constructor(gameHandler: GameHandler)
    {
        this.gameHandler = gameHandler;

        var self = this;
        this.gameHandler.eventHandler.addEventListener("CommandTrigger", function (sender, arg)
        {
            self.commandCalled(arg);
        });


    }

    // List of Eventhandling functions for the "onEvent" Type
    private eventHandler: { [index: string]: { VariableName: string; Actions: any }[] } = {};

    private variables: { [index: string]: any } = {};

    private loadScript(path: string)
    {
        var script = this.gameHandler.getFile(path);

        if (script != null)
        {
            this.parseScript(script);
        }
        else
        {
            this.gameHandler.warn("Script file is not valid!", path);
        }

    }

    public parseScript(scriptRoot: any)
    {
        if ((scriptRoot === undefined) || (scriptRoot == null))
        {
            this.gameHandler.warn("Not enough arguments for function 'parseScript'");
            return;
        }

        // Check if the first Element is an Array:
        if (scriptRoot.length === undefined)
        {
            // First Element is not an Array
            this.parseScriptNode(scriptRoot);
        }
        else
        {
            // Element is an Array => Parse all childs

            for (var i = 0; i < scriptRoot.length; i++)
            {
                this.parseScriptNode(scriptRoot[i]);
            }
        }

    }

    private parseScriptNode(scriptNode: any)
    {
        try
        {
            if (scriptNode.Type === undefined)
            {
                this.gameHandler.warn("Can't parse object as Script, no Type attribute found!", scriptNode);
                return;
            }

            var type: ElementTypes = (this.typeShortcuts[<string>scriptNode.Type] !== undefined) ?
                this.typeShortcuts[<string>scriptNode.Type] : ElementTypes[<string>scriptNode.Type];

            if ((type === undefined) || (type == null))
            {
                this.gameHandler.warn("Can't parse object as Script, unknown Type", scriptNode);
                return;
            }

            switch (type)
            {
                case ElementTypes.OnEvent:
                    this.handleOnEvent(scriptNode);
                    break;

                case ElementTypes.SetVariable:
                    this.handleSetVariable(scriptNode);
                    break;

                case ElementTypes.If:
                    this.handleIf(scriptNode);
                    break;
                case ElementTypes.Command:

                    if (this.checkParam(scriptNode, "Name"))
                    {
                        // Call event to see who is listening for this command ...

                        this.gameHandler.eventHandler.callEvent("CommandTrigger", this, scriptNode);
                    }

                    break;
                case ElementTypes.Event:

                    if (this.checkParam(scriptNode, "Name") && this.checkParam(scriptNode, "Arguments"))
                    {
                        this.gameHandler.eventHandler.callEvent(scriptNode.Name, this, scriptNode.Arguments);
                    }

                    break;

                case ElementTypes.Increment:

                    if (this.checkParam(scriptNode, "Name"))
                    {
                        if (this.variables[scriptNode.Name] !== undefined)
                        {
                            this.variables[scriptNode.Name] = Number(this.variables[scriptNode.Name]) + 1;
                        }
                        else
                        {
                            this.gameHandler.warn("Unknown Varibale Name: ", scriptNode.Name);
                        }

                    }

                    break;
                case ElementTypes.Decrement:

                    if (this.checkParam(scriptNode, "Name"))
                    {
                        if (this.variables[scriptNode.Name] !== undefined)
                        {
                            this.variables[scriptNode.Name] = Number(this.variables[scriptNode.Name]) - 1;
                        }
                        else
                        {
                            this.gameHandler.warn("Unknown Varibale Name: ", scriptNode.Name);
                        }

                    }

                    break;
                case ElementTypes.Add:

                    if (this.checkParam(scriptNode, "Values") && this.checkParam(scriptNode, "Target"))
                    {
                        if (scriptNode.Values.length === undefined)
                        {
                            this.gameHandler.warn("Not a valid Value Argument for Add Statement: ", scriptNode);
                            return false;
                        }

                        var values = this.parseValue(scriptNode.Values);

                        var data: any = 0;

                        for (var i = 0; i < values.length; i++)
                        {
                            data += values[i];
                        }

                        this.variables[scriptNode.Target] = data;

                    }

                    break;
                case ElementTypes.Sub:

                    if (this.checkParam(scriptNode, "Values") && this.checkParam(scriptNode, "Target"))
                    {
                        if (scriptNode.Values.length === undefined)
                        {
                            this.gameHandler.warn("Not a valid Value Argument for Sub Statement: ", scriptNode);
                            return false;
                        }

                        var values = this.parseValue(scriptNode.Values);

                        var data: any = values[0];

                        for (var i = 1; i < values.length; i++)
                        {
                            data -= values[i];
                        }

                        this.variables[scriptNode.Target] = data;

                    }

                    break;
                case ElementTypes.Mult:

                    if (this.checkParam(scriptNode, "Values") && this.checkParam(scriptNode, "Target"))
                    {
                        if (scriptNode.Values.length === undefined)
                        {
                            this.gameHandler.warn("Not a valid Value Argument for Mult Statement: ", scriptNode);
                            return false;
                        }

                        var values = this.parseValue(scriptNode.Values);

                        var data: any = 1;

                        for (var i = 0; i < values.length; i++)
                        {
                            data *= values[i];
                        }

                        this.variables[scriptNode.Target] = data;

                    }

                    break;
                case ElementTypes.Div:

                    if (this.checkParam(scriptNode, "Values") && this.checkParam(scriptNode, "Target"))
                    {
                        if (scriptNode.Values.length === undefined)
                        {
                            this.gameHandler.warn("Not a valid Value Argument for Div Statement: ", scriptNode);
                            return false;
                        }

                        var values = this.parseValue(scriptNode.Values);

                        var data: any = values[0];

                        for (var i = 1; i < values.length; i++)
                        {
                            data /= values[i];
                        }

                        this.variables[scriptNode.Target] = data;

                    }

                    break;

                case ElementTypes.Sound:
                    if (this.checkParam(scriptNode, "Path"))
                    {
                        var audio = new Audio(scriptNode.Path);
                        audio.play();
                    }

                    break;

                default:
                    this.gameHandler.warn("Not supported Type in Script: ", type, scriptNode);

                    break;

            }



        } catch (ex)
        {
            this.gameHandler.warn("Can't parse object as Script: ", ex, scriptNode);
        }
    }


    private handleOnEvent(node: any)
    {
        if (this.checkParam(node, "Event") && this.checkParam(node, "Actions"))
        {
            if (this.eventHandler[node.Event] === undefined)
            {
                this.eventHandler[node.Event] = [];

                var data =
                    {
                        Actions: node.Actions,
                        VariableName: (node.ArgumentName !== undefined) ? node.ArgumentName : null
                    };



                var self = this;
                this.gameHandler.eventHandler.addEventListener(node.Event, function (sender, args)
                {


                    for (var i = 0; i < self.eventHandler[node.Event].length; i++)
                    {
                        var variableName = self.eventHandler[node.Event][i].VariableName;

                        if ((variableName !== undefined) && (variableName != null))
                        {
                            self.variables[variableName] = args;
                        }

                        self.parseScript(self.eventHandler[node.Event][i].Actions);
                    }

                });

            }

            this.eventHandler[node.Event].push(data);
        }
    }


    private handleSetVariable(node: any)
    {
        if (this.checkParam(node, "Name") && this.checkParam(node, "Value"))
        {
            this.variables[node.Name] = this.parseValue(node.Value);
        }

    }


    private commandCalled(argument: any)
    {
        var command: string = <string>argument.Name;

        switch (command)
        {
            case "Log":

                if (this.checkParam(argument, "Value"))
                {
                    console.log(this.parseValue(argument.Value));
                }
                break;

        }


    }

    private handleIf(node: any)
    {
        if (this.checkParam(node, "Conditions") && this.checkParam(node, "Then"))
        {
            var conditions = this.parseValue(node.Conditions);

            var ok = true;

            if (conditions.length === undefined)
            {
                ok = Boolean(conditions);
            }
            else
            {
                for (var i = 0; i < conditions.length; i++)
                {
                    ok = ok && Boolean(conditions[i]);
                }

            }

            if (ok)
            {
                if (node.Then.length !== undefined)
                {
                    for (var i = 0; i < node.Then.length; i++)
                    {
                        this.parseScript(node.Then);
                    }
                }
                else
                {
                    this.parseScriptNode(node.Then);
                }
            }
            else if (node.Else !== undefined)
            {
                if (node.Else.length !== undefined)
                {
                    for (var i = 0; i < node.Else.length; i++)
                    {
                        this.parseScript(node.Else);
                    }
                }
                else
                {
                    this.parseScriptNode(node.Else);
                }
            }


        }
    }


    private parseValue(value: any): any
    {
        if (typeof (value) !== "object")
        {
            return value;
        }
        else
        {
            if (value.Type === undefined)
            {
                if (value.length !== undefined)
                {
                    // This is an Array ...
                    var result = [];

                    for (var i = 0; i < value.length; i++)
                    {
                        result.push(this.parseValue(value[i]));
                    }

                    return result;
                }
                else
                {
                    this.gameHandler.warn("Can't parse as Value: ", value);
                    return null;
                }
            }
            else
            {
                try
                {
                    var type: ElementTypes = (this.typeShortcuts[<string>value.Type] !== undefined) ?
                        this.typeShortcuts[<string>value.Type] : ElementTypes[<string>value.Type];

                    if ((type === undefined) || (type == null))
                    {
                        this.gameHandler.warn("Can't parse object as Value, unknown Type", value);
                        return null;
                    }

                    switch (type)
                    {
                        case ElementTypes.Variable:

                            if (this.checkParam(value, "Name"))
                            {
                                return this.getVariable(value.Name);
                            }
                            else
                            {
                                return null;
                            }
                            break;

                        case ElementTypes.Eq:

                            if (this.checkParam(value, "Values"))
                            {
                                if (value.Values.length === undefined)
                                {
                                    this.gameHandler.warn("Not a valid Value Argument for Equals Statement: ", value);
                                    return false;
                                }
                                if (value.Values.length != 2)
                                {
                                    this.gameHandler.warn("Need exactly two Arguments for Equals Statement: ", value);
                                    return false;
                                }

                                var values = this.parseValue(value.Values);

                                return (values[0] == values[1]);

                            }
                            break;


                        case ElementTypes.Neq:

                            if (this.checkParam(value, "Values"))
                            {
                                if (value.Values.length === undefined)
                                {
                                    this.gameHandler.warn("Not a valid Value Argument for Not Equals Statement: ", value);
                                    return false;
                                }
                                if (value.Values.length != 2)
                                {
                                    this.gameHandler.warn("Need exactly two Arguments for Not Equals Statement: ", value);
                                    return false;
                                }

                                var values = this.parseValue(value.Values);

                                return (values[0] != values[1]);

                            }

                            break;

                        case ElementTypes.Gt:

                            if (this.checkParam(value, "Values"))
                            {
                                if (value.Values.length === undefined)
                                {
                                    this.gameHandler.warn("Not a valid Value Argument for Greater Than Statement: ", value);
                                    return false;
                                }
                                if (value.Values.length != 2)
                                {
                                    this.gameHandler.warn("Need exactly two Arguments for Greater Than Statement: ", value);
                                    return false;
                                }

                                var values = this.parseValue(value.Values);

                                return (values[0] > values[1]);

                            }

                            break;

                        case ElementTypes.Lt:

                            if (this.checkParam(value, "Values"))
                            {
                                if (value.Values.length === undefined)
                                {
                                    this.gameHandler.warn("Not a valid Value Argument for Less Than Statement: ", value);
                                    return false;
                                }
                                if (value.Values.length != 2)
                                {
                                    this.gameHandler.warn("Need exactly two Arguments for Less Than Statement: ", value);
                                    return false;
                                }

                                var values = this.parseValue(value.Values);

                                return (values[0] < values[1]);

                            }

                            break;

                        case ElementTypes.GtE:

                            if (this.checkParam(value, "Values"))
                            {
                                if (value.Values.length === undefined)
                                {
                                    this.gameHandler.warn("Not a valid Value Argument for Greater Than Equals Statement: ", value);
                                    return false;
                                }
                                if (value.Values.length != 2)
                                {
                                    this.gameHandler.warn("Need exactly two Arguments for Greater Than Equals Statement: ", value);
                                    return false;
                                }

                                var values = this.parseValue(value.Values);

                                return (values[0] >= values[1]);

                            }

                            break;

                        case ElementTypes.LtE:

                            if (this.checkParam(value, "Values"))
                            {
                                if (value.Values.length === undefined)
                                {
                                    this.gameHandler.warn("Not a valid Value Argument for Less Than Equals Statement: ", value);
                                    return false;
                                }
                                if (value.Values.length != 2)
                                {
                                    this.gameHandler.warn("Need exactly two Arguments for Less Than Equals Statement: ", value);
                                    return false;
                                }

                                var values = this.parseValue(value.Values);

                                return (values[0] <= values[1]);

                            }

                            break;

                        case ElementTypes.Not:

                            if (this.checkParam(value, "Values"))
                            {
                                if (value.Values.length !== undefined)
                                {
                                    this.gameHandler.warn("Not a valid Value Argument for Not Statement: ", value);
                                    return false;
                                }


                                var value = this.parseValue(value.Values);

                                return (!value);

                            }

                            break;

                        case ElementTypes.And:

                            if (this.checkParam(value, "Values"))
                            {
                                if (value.Values.length === undefined)
                                {
                                    this.gameHandler.warn("Not a valid Value Argument for And Statement: ", value);
                                    return false;
                                }


                                var values = this.parseValue(value.Values);

                                var data: any = true;

                                for (var i = 0; i < values.length; i++)
                                {
                                    data = data && values[i];
                                }

                                return data;

                            }

                            break;

                        case ElementTypes.Nand:

                            if (this.checkParam(value, "Values"))
                            {
                                if (value.Values.length === undefined)
                                {
                                    this.gameHandler.warn("Not a valid Value Argument for Not And Statement: ", value);
                                    return false;
                                }


                                var values = this.parseValue(value.Values);

                                var data: any = true;

                                for (var i = 0; i < values.length; i++)
                                {
                                    data = data && values[i];
                                }

                                return !data;

                            }

                            break;

                        case ElementTypes.Or:

                            if (this.checkParam(value, "Values"))
                            {
                                if (value.Values.length === undefined)
                                {
                                    this.gameHandler.warn("Not a valid Value Argument for Or Statement: ", value);
                                    return false;
                                }


                                var values = this.parseValue(value.Values);

                                var data: any = false;

                                for (var i = 0; i < values.length; i++)
                                {
                                    data = data || values[i];
                                }

                                return data;

                            }

                            break;

                        case ElementTypes.Nor:

                            if (this.checkParam(value, "Values"))
                            {
                                if (value.Values.length === undefined)
                                {
                                    this.gameHandler.warn("Not a valid Value Argument for Not Or Statement: ", value);
                                    return false;
                                }


                                var values = this.parseValue(value.Values);

                                var data: any = false;

                                for (var i = 0; i < values.length; i++)
                                {
                                    data = data || values[i];
                                }

                                return !data;

                            }

                            break;



                        case ElementTypes.Add:

                            if (this.checkParam(value, "Values"))
                            {
                                if (value.Values.length === undefined)
                                {
                                    this.gameHandler.warn("Not a valid Value Argument for Add Statement: ", value);
                                    return false;
                                }

                                if (value.Target !== undefined)
                                {
                                    this.gameHandler.warn("The 'Target' Attribute is not valid when used as Parameter! This Parameter is going to be ignored.", value);
                                }


                                var values = this.parseValue(value.Values);

                                var data: any = 0;

                                for (var i = 0; i < values.length; i++)
                                {
                                    data += values[i];
                                }

                                return data;

                            }

                            break;

                        case ElementTypes.Sub:

                            if (this.checkParam(value, "Values"))
                            {
                                if (value.Values.length === undefined)
                                {
                                    this.gameHandler.warn("Not a valid Value Argument for Sub Statement: ", value);
                                    return false;
                                }

                                if (value.Target !== undefined)
                                {
                                    this.gameHandler.warn("The 'Target' Attribute is not valid when used as Parameter! This Parameter is going to be ignored.", value);
                                }


                                var values = this.parseValue(value.Values);

                                var data: any = values[0];

                                for (var i = 1; i < values.length; i++)
                                {
                                    data -= values[i];
                                }

                                return data;

                            }

                            break;

                        case ElementTypes.Mult:

                            if (this.checkParam(value, "Values"))
                            {
                                if (value.Values.length === undefined)
                                {
                                    this.gameHandler.warn("Not a valid Value Argument for Mult Statement: ", value);
                                    return false;
                                }

                                if (value.Target !== undefined)
                                {
                                    this.gameHandler.warn("The 'Target' Attribute is not valid when used as Parameter! This Parameter is going to be ignored.", value);
                                }


                                var values = this.parseValue(value.Values);

                                var data: any = 1;

                                for (var i = 0; i < values.length; i++)
                                {
                                    data *= values[i];
                                }

                                return data;

                            }
                            break;

                        case ElementTypes.Div:

                            if (this.checkParam(value, "Values"))
                            {
                                if (value.Values.length === undefined)
                                {
                                    this.gameHandler.warn("Not a valid Value Argument for Div Statement: ", value);
                                    return false;
                                }

                                if (value.Target !== undefined)
                                {
                                    this.gameHandler.warn("The 'Target' Attribute is not valid when used as Parameter! This Parameter is going to be ignored.", value);
                                }


                                var values = this.parseValue(value.Values);

                                var data: any = values[0];

                                for (var i = 1; i < values.length; i++)
                                {
                                    data /= values[i];
                                }

                                return data;

                            }

                            break;

                        case ElementTypes.Tile:

                            console.error("Not Implemented yet");

                            break;

                        // Maybe check if any Updates handles this element ...

                        default:
                            this.gameHandler.warn("Not supported Type for Value: ", type, value);
                            return null;

                            break;

                    }



                } catch (ex)
                {
                    this.gameHandler.warn("Error while parsing Value: ", value, ex);
                }
            }


        }

    }

    private getVariable(name: string): any
    {
        if (this.variables[name] !== undefined)
        {
            return this.variables[name];
        }
        else
        {
            this.gameHandler.warn("Variable not set!: ", name);
            return null;
        }
    }


    private checkParam(element: any, argument: string): boolean
    {
        if (element[argument] === undefined)
        {
            this.gameHandler.warn("Missing Argument '" + argument + "' on '" + element.Type + "' Node! ", element);
            return false;
        }
        else
        {
            return true;
        }
    }

}