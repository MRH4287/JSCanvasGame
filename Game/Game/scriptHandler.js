/// <reference path="gameHandler.ts" />
var ElementTypes;
(function (ElementTypes) {
    ElementTypes[ElementTypes["Unknown"] = 0] = "Unknown";
    ElementTypes[ElementTypes["OnEvent"] = 1] = "OnEvent";
    ElementTypes[ElementTypes["SetVariable"] = 2] = "SetVariable";
    ElementTypes[ElementTypes["If"] = 3] = "If";
    ElementTypes[ElementTypes["Command"] = 4] = "Command";
    ElementTypes[ElementTypes["Event"] = 5] = "Event";
    ElementTypes[ElementTypes["Variable"] = 6] = "Variable";
    ElementTypes[ElementTypes["Increment"] = 7] = "Increment";
    ElementTypes[ElementTypes["Decrement"] = 8] = "Decrement";
    ElementTypes[ElementTypes["Add"] = 9] = "Add";
    ElementTypes[ElementTypes["Sub"] = 10] = "Sub";
    ElementTypes[ElementTypes["Mult"] = 11] = "Mult";
    ElementTypes[ElementTypes["Div"] = 12] = "Div";
    ElementTypes[ElementTypes["Gt"] = 13] = "Gt";
    ElementTypes[ElementTypes["Lt"] = 14] = "Lt";
    ElementTypes[ElementTypes["Eq"] = 15] = "Eq";
    ElementTypes[ElementTypes["Neq"] = 16] = "Neq";
    ElementTypes[ElementTypes["GtE"] = 17] = "GtE";
    ElementTypes[ElementTypes["LtE"] = 18] = "LtE";
    ElementTypes[ElementTypes["And"] = 19] = "And";
    ElementTypes[ElementTypes["Nand"] = 20] = "Nand";
    ElementTypes[ElementTypes["Or"] = 21] = "Or";
    ElementTypes[ElementTypes["Nor"] = 22] = "Nor";
    ElementTypes[ElementTypes["Not"] = 23] = "Not";
    ElementTypes[ElementTypes["Tile"] = 24] = "Tile";
})(ElementTypes || (ElementTypes = {}));

var ScriptHandler = (function () {
    function ScriptHandler(gameHandler) {
        this.typeShortcuts = {
            ">": 13 /* Gt */,
            "<": 14 /* Lt */,
            "==": 15 /* Eq */,
            "!=": 16 /* Neq */,
            ">=": 17 /* GtE */,
            "<=": 18 /* LtE */,
            "&": 19 /* And */,
            "&&": 19 /* And */,
            "|": 21 /* Or */,
            "||": 21 /* Or */,
            "!": 23 /* Not */,
            "+": 9 /* Add */,
            "-": 10 /* Sub */,
            "*": 11 /* Mult */,
            "/": 12 /* Div */
        };
        // List of Eventhandling functions for the "onEvent" Type
        this.eventHandler = {};
        this.variables = {};
        this.gameHandler = gameHandler;

        var self = this;
        this.gameHandler.eventHandler.addEventListener("CommandTrigger", function (sender, arg) {
            self.commandCalled(arg);
        });
    }
    ScriptHandler.prototype.loadScript = function (path) {
        var script = this.gameHandler.getFile(path);

        if (script != null) {
            this.parseScript(script);
        } else {
            this.gameHandler.warn("Script file is not valid!", path);
        }
    };

    ScriptHandler.prototype.parseScript = function (scriptRoot) {
        if ((scriptRoot === undefined) || (scriptRoot == null)) {
            this.gameHandler.warn("Not enough arguments for function 'parseScript'");
            return;
        }

        // Check if the first Element is an Array:
        if (scriptRoot.length === undefined) {
            // First Element is not an Array
            this.parseScriptNode(scriptRoot);
        } else {
            for (var i = 0; i < scriptRoot.length; i++) {
                this.parseScriptNode(scriptRoot[i]);
            }
        }
    };

    ScriptHandler.prototype.parseScriptNode = function (scriptNode) {
        try  {
            if (scriptNode.Type === undefined) {
                this.gameHandler.warn("Can't parse object as Script, no Type attribute found!", scriptNode);
                return;
            }

            var type = (this.typeShortcuts[scriptNode.Type] !== undefined) ? this.typeShortcuts[scriptNode.Type] : ElementTypes[scriptNode.Type];

            if ((type === undefined) || (type == null)) {
                this.gameHandler.warn("Can't parse object as Script, unknown Type", scriptNode);
                return;
            }

            switch (type) {
                case 1 /* OnEvent */:
                    this.handleOnEvent(scriptNode);
                    break;

                case 2 /* SetVariable */:
                    this.handleSetVariable(scriptNode);
                    break;

                case 3 /* If */:
                    this.handleIf(scriptNode);
                    break;
                case 4 /* Command */:
                    if (this.checkParam(scriptNode, "Name")) {
                        // Call event to see who is listening for this command ...
                        this.gameHandler.eventHandler.callEvent("CommandTrigger", this, scriptNode);
                    }

                    break;
                case 5 /* Event */:
                    if (this.checkParam(scriptNode, "Name") && this.checkParam(scriptNode, "Arguments")) {
                        this.gameHandler.eventHandler.callEvent(scriptNode.Name, this, scriptNode.Arguments);
                    }

                    break;

                case 7 /* Increment */:
                    if (this.checkParam(scriptNode, "Name")) {
                        if (this.variables[scriptNode.Name] !== undefined) {
                            this.variables[scriptNode.Name] = Number(this.variables[scriptNode.Name]) + 1;
                        } else {
                            this.gameHandler.warn("Unknown Varibale Name: ", scriptNode.Name);
                        }
                    }

                    break;
                case 8 /* Decrement */:
                    if (this.checkParam(scriptNode, "Name")) {
                        if (this.variables[scriptNode.Name] !== undefined) {
                            this.variables[scriptNode.Name] = Number(this.variables[scriptNode.Name]) - 1;
                        } else {
                            this.gameHandler.warn("Unknown Varibale Name: ", scriptNode.Name);
                        }
                    }

                    break;
                case 9 /* Add */:
                    if (this.checkParam(scriptNode, "Values") && this.checkParam(scriptNode, "Target")) {
                        if (scriptNode.Values.length === undefined) {
                            this.gameHandler.warn("Not a valid Value Argument for Add Statement: ", scriptNode);
                            return false;
                        }

                        var values = this.parseValue(scriptNode.Values);

                        var data = 0;

                        for (var i = 0; i < values.length; i++) {
                            data += values[i];
                        }

                        this.variables[scriptNode.Target] = data;
                    }

                    break;
                case 10 /* Sub */:
                    if (this.checkParam(scriptNode, "Values") && this.checkParam(scriptNode, "Target")) {
                        if (scriptNode.Values.length === undefined) {
                            this.gameHandler.warn("Not a valid Value Argument for Sub Statement: ", scriptNode);
                            return false;
                        }

                        var values = this.parseValue(scriptNode.Values);

                        var data = values[0];

                        for (var i = 1; i < values.length; i++) {
                            data -= values[i];
                        }

                        this.variables[scriptNode.Target] = data;
                    }

                    break;
                case 11 /* Mult */:
                    if (this.checkParam(scriptNode, "Values") && this.checkParam(scriptNode, "Target")) {
                        if (scriptNode.Values.length === undefined) {
                            this.gameHandler.warn("Not a valid Value Argument for Mult Statement: ", scriptNode);
                            return false;
                        }

                        var values = this.parseValue(scriptNode.Values);

                        var data = 1;

                        for (var i = 0; i < values.length; i++) {
                            data *= values[i];
                        }

                        this.variables[scriptNode.Target] = data;
                    }

                    break;
                case 12 /* Div */:
                    if (this.checkParam(scriptNode, "Values") && this.checkParam(scriptNode, "Target")) {
                        if (scriptNode.Values.length === undefined) {
                            this.gameHandler.warn("Not a valid Value Argument for Div Statement: ", scriptNode);
                            return false;
                        }

                        var values = this.parseValue(scriptNode.Values);

                        var data = values[0];

                        for (var i = 1; i < values.length; i++) {
                            data /= values[i];
                        }

                        this.variables[scriptNode.Target] = data;
                    }

                    break;

                default:
                    this.gameHandler.warn("Not supported Type in Script: ", type, scriptNode);

                    break;
            }
        } catch (ex) {
            this.gameHandler.warn("Can't parse object as Script: ", ex, scriptNode);
        }
    };

    ScriptHandler.prototype.handleOnEvent = function (node) {
        if (this.checkParam(node, "Event") && this.checkParam(node, "Actions")) {
            if (this.eventHandler[node.Event] === undefined) {
                this.eventHandler[node.Event] = [];

                var data = {
                    Actions: node.Actions,
                    VariableName: (node.ArgumentName !== undefined) ? node.ArgumentName : null
                };

                var self = this;
                this.gameHandler.eventHandler.addEventListener(node.Event, function (sender, args) {
                    for (var i = 0; i < self.eventHandler[node.Event].length; i++) {
                        var variableName = self.eventHandler[node.Event][i].VariableName;

                        if ((variableName !== undefined) && (variableName != null)) {
                            self.variables[variableName] = args;
                        }

                        self.parseScript(self.eventHandler[node.Event][i].Actions);
                    }
                });
            }

            this.eventHandler[node.Event].push(data);
        }
    };

    ScriptHandler.prototype.handleSetVariable = function (node) {
        if (this.checkParam(node, "Name") && this.checkParam(node, "Value")) {
            this.variables[node.Name] = this.parseValue(node.Value);
        }
    };

    ScriptHandler.prototype.commandCalled = function (argument) {
        var command = argument.Name;

        switch (command) {
            case "Log":
                if (this.checkParam(argument, "Value")) {
                    console.log(this.parseValue(argument.Value));
                }
                break;
        }
    };

    ScriptHandler.prototype.handleIf = function (node) {
        if (this.checkParam(node, "Conditions") && this.checkParam(node, "Then")) {
            var conditions = this.parseValue(node.Conditions);

            var ok = true;

            if (conditions.length === undefined) {
                ok = Boolean(conditions);
            } else {
                for (var i = 0; i < conditions.length; i++) {
                    ok = ok && Boolean(conditions[i]);
                }
            }

            if (ok) {
                if (node.Then.length !== undefined) {
                    for (var i = 0; i < node.Then.length; i++) {
                        this.parseScript(node.Then);
                    }
                } else {
                    this.parseScriptNode(node.Then);
                }
            } else if (node.Else !== undefined) {
                if (node.Else.length !== undefined) {
                    for (var i = 0; i < node.Else.length; i++) {
                        this.parseScript(node.Else);
                    }
                } else {
                    this.parseScriptNode(node.Else);
                }
            }
        }
    };

    ScriptHandler.prototype.parseValue = function (value) {
        if (typeof (value) !== "object") {
            return value;
        } else {
            if (value.Type === undefined) {
                if (value.length !== undefined) {
                    // This is an Array ...
                    var result = [];

                    for (var i = 0; i < value.length; i++) {
                        result.push(this.parseValue(value[i]));
                    }

                    return result;
                } else {
                    this.gameHandler.warn("Can't parse as Value: ", value);
                    return null;
                }
            } else {
                try  {
                    var type = (this.typeShortcuts[value.Type] !== undefined) ? this.typeShortcuts[value.Type] : ElementTypes[value.Type];

                    if ((type === undefined) || (type == null)) {
                        this.gameHandler.warn("Can't parse object as Value, unknown Type", value);
                        return null;
                    }

                    switch (type) {
                        case 6 /* Variable */:
                            if (this.checkParam(value, "Name")) {
                                return this.getVariable(value.Name);
                            } else {
                                return null;
                            }
                            break;

                        case 15 /* Eq */:
                            if (this.checkParam(value, "Values")) {
                                if (value.Values.length === undefined) {
                                    this.gameHandler.warn("Not a valid Value Argument for Equals Statement: ", value);
                                    return false;
                                }
                                if (value.Values.length != 2) {
                                    this.gameHandler.warn("Need exactly two Arguments for Equals Statement: ", value);
                                    return false;
                                }

                                var values = this.parseValue(value.Values);

                                return (values[0] == values[1]);
                            }
                            break;

                        case 16 /* Neq */:
                            if (this.checkParam(value, "Values")) {
                                if (value.Values.length === undefined) {
                                    this.gameHandler.warn("Not a valid Value Argument for Not Equals Statement: ", value);
                                    return false;
                                }
                                if (value.Values.length != 2) {
                                    this.gameHandler.warn("Need exactly two Arguments for Not Equals Statement: ", value);
                                    return false;
                                }

                                var values = this.parseValue(value.Values);

                                return (values[0] != values[1]);
                            }

                            break;

                        case 13 /* Gt */:
                            if (this.checkParam(value, "Values")) {
                                if (value.Values.length === undefined) {
                                    this.gameHandler.warn("Not a valid Value Argument for Greater Than Statement: ", value);
                                    return false;
                                }
                                if (value.Values.length != 2) {
                                    this.gameHandler.warn("Need exactly two Arguments for Greater Than Statement: ", value);
                                    return false;
                                }

                                var values = this.parseValue(value.Values);

                                return (values[0] > values[1]);
                            }

                            break;

                        case 14 /* Lt */:
                            if (this.checkParam(value, "Values")) {
                                if (value.Values.length === undefined) {
                                    this.gameHandler.warn("Not a valid Value Argument for Less Than Statement: ", value);
                                    return false;
                                }
                                if (value.Values.length != 2) {
                                    this.gameHandler.warn("Need exactly two Arguments for Less Than Statement: ", value);
                                    return false;
                                }

                                var values = this.parseValue(value.Values);

                                return (values[0] < values[1]);
                            }

                            break;

                        case 17 /* GtE */:
                            if (this.checkParam(value, "Values")) {
                                if (value.Values.length === undefined) {
                                    this.gameHandler.warn("Not a valid Value Argument for Greater Than Equals Statement: ", value);
                                    return false;
                                }
                                if (value.Values.length != 2) {
                                    this.gameHandler.warn("Need exactly two Arguments for Greater Than Equals Statement: ", value);
                                    return false;
                                }

                                var values = this.parseValue(value.Values);

                                return (values[0] >= values[1]);
                            }

                            break;

                        case 18 /* LtE */:
                            if (this.checkParam(value, "Values")) {
                                if (value.Values.length === undefined) {
                                    this.gameHandler.warn("Not a valid Value Argument for Less Than Equals Statement: ", value);
                                    return false;
                                }
                                if (value.Values.length != 2) {
                                    this.gameHandler.warn("Need exactly two Arguments for Less Than Equals Statement: ", value);
                                    return false;
                                }

                                var values = this.parseValue(value.Values);

                                return (values[0] <= values[1]);
                            }

                            break;

                        case 23 /* Not */:
                            if (this.checkParam(value, "Values")) {
                                if (value.Values.length !== undefined) {
                                    this.gameHandler.warn("Not a valid Value Argument for Not Statement: ", value);
                                    return false;
                                }

                                var value = this.parseValue(value.Values);

                                return (!value);
                            }

                            break;

                        case 19 /* And */:
                            if (this.checkParam(value, "Values")) {
                                if (value.Values.length === undefined) {
                                    this.gameHandler.warn("Not a valid Value Argument for And Statement: ", value);
                                    return false;
                                }

                                var values = this.parseValue(value.Values);

                                var data = true;

                                for (var i = 0; i < values.length; i++) {
                                    data = data && values[i];
                                }

                                return data;
                            }

                            break;

                        case 20 /* Nand */:
                            if (this.checkParam(value, "Values")) {
                                if (value.Values.length === undefined) {
                                    this.gameHandler.warn("Not a valid Value Argument for Not And Statement: ", value);
                                    return false;
                                }

                                var values = this.parseValue(value.Values);

                                var data = true;

                                for (var i = 0; i < values.length; i++) {
                                    data = data && values[i];
                                }

                                return !data;
                            }

                            break;

                        case 21 /* Or */:
                            if (this.checkParam(value, "Values")) {
                                if (value.Values.length === undefined) {
                                    this.gameHandler.warn("Not a valid Value Argument for Or Statement: ", value);
                                    return false;
                                }

                                var values = this.parseValue(value.Values);

                                var data = false;

                                for (var i = 0; i < values.length; i++) {
                                    data = data || values[i];
                                }

                                return data;
                            }

                            break;

                        case 22 /* Nor */:
                            if (this.checkParam(value, "Values")) {
                                if (value.Values.length === undefined) {
                                    this.gameHandler.warn("Not a valid Value Argument for Not Or Statement: ", value);
                                    return false;
                                }

                                var values = this.parseValue(value.Values);

                                var data = false;

                                for (var i = 0; i < values.length; i++) {
                                    data = data || values[i];
                                }

                                return !data;
                            }

                            break;

                        case 9 /* Add */:
                            if (this.checkParam(value, "Values")) {
                                if (value.Values.length === undefined) {
                                    this.gameHandler.warn("Not a valid Value Argument for Add Statement: ", value);
                                    return false;
                                }

                                if (value.Target !== undefined) {
                                    this.gameHandler.warn("The 'Target' Attribute is not valid when used as Parameter! This Parameter is going to be ignored.", value);
                                }

                                var values = this.parseValue(value.Values);

                                var data = 0;

                                for (var i = 0; i < values.length; i++) {
                                    data += values[i];
                                }

                                return data;
                            }

                            break;

                        case 10 /* Sub */:
                            if (this.checkParam(value, "Values")) {
                                if (value.Values.length === undefined) {
                                    this.gameHandler.warn("Not a valid Value Argument for Sub Statement: ", value);
                                    return false;
                                }

                                if (value.Target !== undefined) {
                                    this.gameHandler.warn("The 'Target' Attribute is not valid when used as Parameter! This Parameter is going to be ignored.", value);
                                }

                                var values = this.parseValue(value.Values);

                                var data = values[0];

                                for (var i = 1; i < values.length; i++) {
                                    data -= values[i];
                                }

                                return data;
                            }

                            break;

                        case 11 /* Mult */:
                            if (this.checkParam(value, "Values")) {
                                if (value.Values.length === undefined) {
                                    this.gameHandler.warn("Not a valid Value Argument for Mult Statement: ", value);
                                    return false;
                                }

                                if (value.Target !== undefined) {
                                    this.gameHandler.warn("The 'Target' Attribute is not valid when used as Parameter! This Parameter is going to be ignored.", value);
                                }

                                var values = this.parseValue(value.Values);

                                var data = 1;

                                for (var i = 0; i < values.length; i++) {
                                    data *= values[i];
                                }

                                return data;
                            }
                            break;

                        case 12 /* Div */:
                            if (this.checkParam(value, "Values")) {
                                if (value.Values.length === undefined) {
                                    this.gameHandler.warn("Not a valid Value Argument for Div Statement: ", value);
                                    return false;
                                }

                                if (value.Target !== undefined) {
                                    this.gameHandler.warn("The 'Target' Attribute is not valid when used as Parameter! This Parameter is going to be ignored.", value);
                                }

                                var values = this.parseValue(value.Values);

                                var data = values[0];

                                for (var i = 1; i < values.length; i++) {
                                    data /= values[i];
                                }

                                return data;
                            }

                            break;

                        case 24 /* Tile */:
                            console.error("Not Implemented yet");

                            break;

                        default:
                            this.gameHandler.warn("Not supported Type for Value: ", type, value);
                            return null;

                            break;
                    }
                } catch (ex) {
                    this.gameHandler.warn("Error while parsing Value: ", value, ex);
                }
            }
        }
    };

    ScriptHandler.prototype.getVariable = function (name) {
        if (this.variables[name] !== undefined) {
            return this.variables[name];
        } else {
            this.gameHandler.warn("Variable not set!: ", name);
            return null;
        }
    };

    ScriptHandler.prototype.checkParam = function (element, argument) {
        if (element[argument] === undefined) {
            this.gameHandler.warn("Missing Argument '" + argument + "' on '" + element.Type + "' Node! ", element);
            return false;
        } else {
            return true;
        }
    };
    return ScriptHandler;
})();
