/// <reference path="gameHandler.ts" />

class WindowManager
{
    private gameHandler: GameHandler;

    private offsetDiff = {
        X: 0,
        Y: 0
    };

    constructor(gameHandler: GameHandler)
    {
        this.gameHandler = gameHandler;

        var self = this;
        this.gameHandler.eventHandler.addEventListener("PlayerPositionChanged", function (sender, args)
        {
            self.onPlayerPositionUpdate(self, sender, args);
        });

        this.setSize(this.gameHandler.config.width, this.gameHandler.config.height);
    }


    private onPlayerPositionUpdate(self: WindowManager, sender: PlayerManager, postion: Coordinate)
    {
        var tileSize = this.gameHandler.config.tileSize;

        var mapSize = this.gameHandler.renderer.getMapSize();

        var maxOffset: Coordinate = {
            X: mapSize.X - this.gameHandler.config.width,
            Y: mapSize.Y - this.gameHandler.config.height,
        };

        var offsetToSet: Coordinate = {
            X: (postion.X * tileSize) - this.offsetDiff.X,
            Y: (postion.Y * tileSize) - this.offsetDiff.Y
        };

        offsetToSet = {
            X: (offsetToSet.X < 0) ? 0 : ((offsetToSet.X > maxOffset.X) ? maxOffset.X : offsetToSet.X),  //offsetToSet.X,
            Y: (offsetToSet.Y < 0) ? 0 : ((offsetToSet.Y > maxOffset.Y) ? maxOffset.Y : offsetToSet.Y) // offsetToSet.Y
        };

        this.gameHandler.renderer.setOffset(offsetToSet);

    }

    public setSize(width: number, height: number)
    {
        this.offsetDiff = {
            X: width / 2,
            Y: height / 2
        };



    }
}
