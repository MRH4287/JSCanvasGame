/// <reference path="gameHandler.ts" />
var WindowManager = (function () {
    function WindowManager(gameHandler) {
        this.offsetDiff = {
            X: 0,
            Y: 0
        };
        this.gameHandler = gameHandler;

        var self = this;
        this.gameHandler.eventHandler.addEventListener("PlayerPositionChanged", function (sender, args) {
            self.onPlayerPositionUpdate(self, sender, args);
        });

        this.setSize(this.gameHandler.config.width, this.gameHandler.config.height);
    }
    WindowManager.prototype.onPlayerPositionUpdate = function (self, sender, postion) {
        var tileSize = this.gameHandler.config.tileSize;

        var mapSize = this.gameHandler.renderer.getMapSize();

        var maxOffset = {
            X: mapSize.X - this.gameHandler.config.width,
            Y: mapSize.Y - this.gameHandler.config.height
        };

        var offsetToSet = {
            X: (postion.X * tileSize) - this.offsetDiff.X,
            Y: (postion.Y * tileSize) - this.offsetDiff.Y
        };

        offsetToSet = {
            X: (offsetToSet.X < 0) ? 0 : ((offsetToSet.X > maxOffset.X) ? maxOffset.X : offsetToSet.X),
            Y: (offsetToSet.Y < 0) ? 0 : ((offsetToSet.Y > maxOffset.Y) ? maxOffset.Y : offsetToSet.Y)
        };

        this.gameHandler.renderer.setOffset(offsetToSet);
    };

    WindowManager.prototype.setSize = function (width, height) {
        this.offsetDiff = {
            X: width / 2,
            Y: height / 2
        };
    };
    return WindowManager;
})();
