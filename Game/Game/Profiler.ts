/// <reference path="gameHandler.ts" />

class Profiler
{
    private gameHandler: GameHandler;

    public TaskList: { [index: string]: number } = {};

    constructor(gameHandler: GameHandler)
    {
        this.gameHandler = gameHandler;

        var self = this;
        this.gameHandler.eventHandler.addEventListener("TaskCreated", function (s, arg)
        {
            if (self.TaskList[arg] === undefined)
            {
                self.TaskList[arg] = 0;
            }

            self.TaskList[arg] += 1;

        });


        this.gameHandler.eventHandler.addEventListener("TaskDisposed", function (s, arg)
        {
            if (self.TaskList[arg] !== undefined)
            {
                self.TaskList[arg] -= 1;

                if (self.TaskList[arg] <= 0)
                {
                    delete self.TaskList[arg];
                }
            }

        });

    }



}