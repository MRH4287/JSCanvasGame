/// <reference path="gameHandler.ts" />
var Profiler = (function () {
    function Profiler(gameHandler) {
        this.TaskList = {};
        this.gameHandler = gameHandler;

        var self = this;
        this.gameHandler.eventHandler.addEventListener("TaskCreated", function (s, arg) {
            if (self.TaskList[arg] === undefined) {
                self.TaskList[arg] = 0;
            }

            self.TaskList[arg] += 1;
        });

        this.gameHandler.eventHandler.addEventListener("TaskDisposed", function (s, arg) {
            if (self.TaskList[arg] === undefined) {
                self.TaskList[arg] = 0;
            } else {
                self.TaskList[arg] -= 1;
            }
        });
    }
    return Profiler;
})();
