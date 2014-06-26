/// <reference path="gameHandler.ts" />

class Profiler
{
    private gameHandler: GameHandler;

    public taskList: { [index: string]: number } = {};

    constructor(gameHandler: GameHandler)
    {
        this.gameHandler = gameHandler;

        var self = this;
        this.gameHandler.eventHandler.addEventListener("TaskCreated", function (s, arg)
        {
            if (self.taskList[arg] === undefined)
            {
                self.taskList[arg] = 0;
            }

            self.taskList[arg] += 1;

        });


        this.gameHandler.eventHandler.addEventListener("TaskDisposed", function (s, arg)
        {
            if (self.taskList[arg] !== undefined)
            {
                self.taskList[arg] -= 1;

                if (self.taskList[arg] <= 0)
                {
                    delete self.taskList[arg];
                }
            }

        });

    }

}
