﻿/// <reference path="astar.d.ts" />

class PathHandler
{
    private gameHandler: GameHandler;

    constructor(gameHandler: GameHandler)
    {
        this.gameHandler = gameHandler;
    }

    private debugElements: string[] = [];

    private STOP = false;

    public stopAllMovements()
    {
        this.STOP = true;
        var self = this;

        window.setTimeout(function ()
        {
            self.STOP = false;

        }, 1000);

    }


    public getRouteRaw(startPos: Coordinate, endPos: Coordinate): GridNode[]
    {
        var map = this.gameHandler.getMapPassableData();

        var graph = new Graph(map);

        var start = graph.grid[startPos.X - 1][startPos.Y - 1];
        var end = graph.grid[endPos.X - 1][endPos.Y - 1];

        return astar.search(graph, start, end);
    }

    public getRoute(startPos: Coordinate, endPos: Coordinate, drawRoute: boolean = false): Coordinate[]
    {
        var data = this.getRouteRaw(startPos, endPos);

        var result: Coordinate[] = [];

        for (var i = 0; i < data.length; i++)
        {
            result[i] =
            {
                X: data[i].x + 1,
                Y: data[i].y + 1
            };
        }

        if (drawRoute === true)
        {
            this.drawRoute(startPos, result);
        }

        return result;
    }

    public drawRoute(start: Coordinate, route: Coordinate[])
    {
        this.clearRoute();

        var counter: number = 0;

        var last: Coordinate = start;

        for (var i = 0; i < route.length; i++)
        {
            var width = this.gameHandler.config.tileSize;
            var height = this.gameHandler.config.tileSize;

            var current: Coordinate = route[i];
            var anchor: Coordinate;

            var offset = CoordinateHelper.Subtract(last, current);
            if (offset.X !== 0)
            {
                width *= 2;

                if (offset.X < 0)
                {
                    anchor = last;
                }
                else if (offset.X > 0)
                {
                    anchor = current;
                }
            }
            else if (offset.Y !== 0)
            {
                height *= 2;

                if (offset.Y < 0)
                {
                    anchor = last;
                }
                else if (offset.Y > 0)
                {
                    anchor = current;
                }
            }

            //console.log("Draw Path Element - Width: " + width + " Height: " + height + " .. Anchor: ", anchor);

            var title = "pathHandlerDebugRect-" + (counter++);

            var tileSize = this.gameHandler.config.tileSize;

            this.gameHandler.topAnimationHandler.drawColorRect(title, (anchor.X - 1) * tileSize, (anchor.Y - 1) * tileSize, width, height, 255, 0, 0, 0.3, false);
            this.debugElements.push(title);

            last = current;
        }
    }

    public clearRoute()
    {
        for (var i = 0; i < this.debugElements.length; i++)
        {
            this.gameHandler.topAnimationHandler.removeGenericDraw(this.debugElements[i]);
        }

        this.debugElements = [];
    }


    public movePlayer(end: Coordinate, drawRoute: boolean = false, onFinish: () => void = undefined)
    {
        var self = this;

        var start = this.gameHandler.playerManager.getPosition();
        var route = this.getRoute(start, end, drawRoute);

        var index = 0;
        var lastDirection: WalkDirection = WalkDirection.None;

        var callback = function ()
        {
            if (self.STOP)
            {
                return;
            }

            if (index + 1 >= route.length)
            {
                if (typeof (onFinish) !== "undefined")
                {
                    onFinish();
                }
                else
                {
                    console.log("Reached Destination");
                }
           
                return;
            }
            var current = route[index];
            var end = route[index + 1];

            var direction = self.getDirectionFromOffset(current, end);

            var runAnimation = direction !== lastDirection;

            self.gameHandler.playerManager.initMove(direction, runAnimation, callback, !(index + 2 >= route.length));

            lastDirection = direction;
            index++;
        };

        var initialDirection = this.getDirectionFromOffset(start, route[0]);
        lastDirection = initialDirection;

        this.gameHandler.playerManager.initMove(initialDirection, true, callback);


    }

    public moveNPC(name: string, end: Coordinate, drawRoute: boolean = false, onFinish: ()=>void = undefined)
    {
        var self = this;
        var npc = this.gameHandler.npcManager.getNPC(name);

        var start = npc.Position;
        var route = this.getRoute(start, end, drawRoute);

        var index = 0;
        var lastDirection: WalkDirection = WalkDirection.None;

        var callback = function ()
        {
            if (self.STOP)
            {
                return;
            }

            if (index + 1 >= route.length)
            {
                if (typeof (onFinish) !== "undefined")
                {
                    onFinish();
                }
                else
                {
                    console.log("Reached Destination");
                }
                return;
            }
            var current = route[index];
            var end = route[index + 1];

            var direction = self.getDirectionFromOffset(current, end);

            var runAnimation = direction !== lastDirection;


            self.gameHandler.npcManager.initMove(name, direction, callback);
            //self.gameHandler.playerManager.initMove(direction, runAnimation, callback);

            lastDirection = direction;
            index++;
        };

        var initialDirection = this.getDirectionFromOffset(start, route[0]);
        lastDirection = initialDirection;

        //this.gameHandler.playerManager.initMove(initialDirection, true, callback);
        self.gameHandler.npcManager.initMove(name, initialDirection, callback);
    }


    private getDirectionFromOffset(start: Coordinate, end: Coordinate): WalkDirection
    {
        var offset = CoordinateHelper.Subtract(end, start);

        if (offset.X > 0)
        {
            return WalkDirection.Right;
        }
        else if (offset.X < 0)
        {
            return WalkDirection.Left;
        }
        else if (offset.Y > 0)
        {
            return WalkDirection.Down;
        }
        else if (offset.Y < 0)
        {
            return WalkDirection.Up;
        }

        return WalkDirection.None;
    }

}
