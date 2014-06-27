/// <reference path="astar.d.ts" />

class PathHandler
{
    private gameHandler: GameHandler;

    constructor(gameHandler: GameHandler)
    {
        this.gameHandler = gameHandler;
    }


   /* public getRoute(startX: number, startY: number, endX: number, endY: number): Position[]
    {
        var map = this.gameHandler.getMapPassableData();

        var graph = new Graph(map);

        var start = graph.grid[startY - 1][startX - 1];
        var end = graph.grid[endY - 1][endY - 1];

        return astar.search(graph, start, end);
    }*/
}
