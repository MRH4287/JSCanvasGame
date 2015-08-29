/// <reference path="gameHandler.ts" />

class TileHandler
{
    private gameHandler: GameHandler;
    private lastTile: Tile = undefined;

    private variableRegEx: RegExp = new RegExp("\\$\\(([^\\)]+)\\)", "ig");

    constructor(gameHandler: GameHandler)
    {
        this.gameHandler = gameHandler;

        this.gameHandler.eventHandler.addEventListener("PlayerPositionChanged", (sender, position: Coordinate) =>
        {
            if (position.X % 1 !== 0 || position.Y % 1 !== 0)
            {
                return;
            }

            var y = position.Y - 1;
            var x = position.X - 1;

            if (this.gameHandler.map[y] === undefined || this.gameHandler.map[y][x] === undefined)
            {
                return;
            }

            var tile = this.gameHandler.map[y][x];

            this.handleTile(tile);
        });

    }

    private handleTile(tile: Tile)
    {
        if (this.lastTile !== undefined && this.lastTile.EventMapping !== undefined)
        {
            if (this.lastTile.EventMapping["leave"] !== undefined)
            {
                this.runEvent(this.lastTile, "leave", this.lastTile.EventMapping["leave"]);
            }
        }

        if (tile.EventMapping !== undefined)
        {
            if (tile.EventMapping["enter"] !== undefined)
            {
                this.runEvent(tile, "enter", tile.EventMapping["enter"]);
            }
        }

        this.lastTile = tile;
    }


    private runEvent(tile: Tile, event: string, command: string)
    {
        var commandData = undefined;
        event = event.toLowerCase();

        try
        {
            commandData = this.replaceVariables(command, tile);
        }
        catch (ex)
        {
            this.gameHandler.warn("Error while parsing Variable: ", ex);
        }

        this.gameHandler.eventHandler.callEvent("Tile-" + event, this, { Tile: tile, Event: event, Command: commandData });

        eval("this." + commandData);
    }

    private replaceVariables(input: string, tile: Tile): string
    {
        var match;

        while ((match = this.variableRegEx.exec(input)) !== null)
        {
            var varName = match[1];
            var value = "undefined";

            if (tile[varName] !== undefined)
            {
                value = tile[varName];
            }
            else if (this.gameHandler.config[varName] !== undefined)
            {
                value = this.gameHandler.config[varName];
            }
            else
            {
                
                    var gameHandler = this.gameHandler;
                    try
                    {
                        value = eval("gameHandler." + varName);
                    }
                    catch (e)
                    {
                    }

                    if (value === undefined)
                    {
                        try
                        {
                            value = eval(varName);
                        }
                        catch (e)
                        {
                        }
                    }
            }

            input = input.replace(match[0], value);
        }

        return input;
    }


    // ----- Events ----

    private teleport(targetFile: string, targetTile: string, targetDirection: string)
    {
        console.log("Teleporting Player: ", targetFile, targetTile, targetDirection);

        var movePlayer = () =>
        {
            var target = this.gameHandler.getTileByID(targetTile);
            if (target !== undefined)
            {
                console.log("Move Player to: " + target);

                this.gameHandler.playerManager.movePlayer({ X: target.XCoord, Y: target.YCoord });
            }
            else
            {
                console.warn("Teleport failed!");
            }
        };

        if (targetFile !== this.gameHandler.config.mapPath)
        {
            this.gameHandler.changeLevel(targetFile, () =>
            {
                movePlayer();
            });
        }
        else
        {
            movePlayer();
        }

    }



}
