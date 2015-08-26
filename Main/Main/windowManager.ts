/// <reference path="gameHandler.ts" />

class WindowManager
{
    private gameHandler: GameHandler;

    private offsetDiff: Coordinate = {
        X: 0,
        Y: 0
    };

    private targetPos: Coordinate = {
        X: 0,
        Y: 0
    };

    private currentPos: Coordinate = null;


    constructor(gameHandler: GameHandler)
    {
        this.gameHandler = gameHandler;

        var self = this;
        this.gameHandler.eventHandler.addEventListener("PlayerPositionChanged", function (sender, args)
        {
            self.onPlayerPositionUpdate(self, sender, args);
        });

        this.setSize(this.gameHandler.config.width, this.gameHandler.config.height);

        this.gameHandler.eventHandler.addTimedTrigger("windowManagerPositionUpdate", "updateWindowPosition", 10, this);

        this.gameHandler.eventHandler.addEventListener("updateWindowPosition", function (sender, args)
        {
            var send: WindowManager = sender;
            send.updateWindowPosition();
        });


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

        this.targetPos = offsetToSet;
        if (this.currentPos === null)
        {
            this.currentPos = offsetToSet;
            this.gameHandler.renderer.setOffset(offsetToSet);
        }

        //this.gameHandler.renderer.setOffset(offsetToSet);

    }

    private updateWindowPosition()
    {
        if (this.currentPos === null)
        {

            return;
        }

        //if (this.currentPos.X !== this.targetPos.X && this.currentPos.Y !== this.targetPos.Y)
        //{
        var diff = CoordinateHelper.Subtract(this.targetPos, this.currentPos);
        var offset = CoordinateHelper.Normalize(diff);
        offset = CoordinateHelper.Multiply(diff, 2);

        if (CoordinateHelper.Length(offset) > CoordinateHelper.Length(diff))
        {
            offset = diff;
        }

        if (offset.X !== NaN && offset.Y !== NaN)
        {
            this.currentPos = CoordinateHelper.Add(this.currentPos, offset);

            if (this.gameHandler.config.verbose)
            {
                this.gameHandler.log("Update Pos: Difference between Current and Target: ", diff);
                this.gameHandler.log("Normalized Offset: ", offset);
                this.gameHandler.log("New Target: ", this.currentPos);
            }

            this.gameHandler.renderer.setOffset(this.currentPos);
        }
        else
        {
            this.gameHandler.log("Normalized Vector is NaN!", { "Target": this.targetPos, "Current": this.currentPos, "diff": diff, "offset": offset });
        }
        //}

    }


    public setSize(width: number, height: number)
    {
        this.offsetDiff = {
            X: width / 2,
            Y: height / 2
        };



    }
}
