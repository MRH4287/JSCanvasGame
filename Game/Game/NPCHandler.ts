/// <reference path="gameHandler.ts" /> 


class NPCHandler
{
    private gameHandler: GameHandler;
    private animation: AnimationHandler;

    private npcList: { [index: string]: NPCData } = {};
    private updatesPerSecond: number = 10;


    constructor(gameHandler: GameHandler, animationHandler: AnimationHandler)
    {
        this.gameHandler = gameHandler;
        this.animation = animationHandler;

        var self = this;

        this.gameHandler.eventHandler.addEventListener("CheckIsPassable", function (s, argument)
        {
            $.each(self.npcList, function (id: string, data: NPCData)
            {
                if ((data.Position.X == argument.X) && (data.Position.Y == argument.Y))
                {
                    argument.result = false;
                }
            });

            // Check if an NPC is standing on this position

        });

    }

    public addNPC(name: string, position: { X: number; Y: number }, animationContainer: string, defaultAnimation: string, speed: number = 1)
    {
        // Add new NPC to System:

        var data: NPCData = {
            ID: name,
            Position: position,
            Target: position,
            GUID: "NPC-Animation-" + String(Math.random() * Math.random() * 10000),
            Direction: WalkDirection.None,
            Speed: speed,
            State: PlayerState.Standing           
        };

        this.npcList[name] = data;

        // Start default Animation for Element:
        this.animation.addAnimation(data.GUID, animationContainer, defaultAnimation, position.X, position.Y);

    }

    public setAnimation(name: string, animationName: string)
    {
        if (this.npcList[name] === undefined)
        {
            this.gameHandler.error("No NPC with this ID found!", name);
            return;
        }

        this.animation.playAnimation(this.npcList[name].GUID, animationName);
    }


    public setPosition(name: string, position: { X: number; Y: number })
    {
        if (this.npcList[name] === undefined)
        {
            this.gameHandler.error("No NPC with this ID found!", name);
            return;
        }

        this.npcList[name].Position = position;
        this.animation.setPosition(this.npcList[name].GUID, position.X, position.Y);
    }


    public initMove(name: string, direction: WalkDirection, callback?: () => any)
    {
        if (this.npcList[name] === undefined)
        {
            this.gameHandler.error("No NPC with this ID found!", name);
            return;
        }

        var npc: NPCData = this.npcList[name];

        if (npc.State == PlayerState.Walking)
        {
            this.gameHandler.log("NPC is already walking", npc);
            return;
        }

        var walkOffset = {
            X: 0,
            Y: 0
        };
        var animation = "stand";
        var idleAnimation = "stand";


        switch (direction)
        {
            case WalkDirection.Right:
                walkOffset.X = 1;
                animation = "walk-right";
                idleAnimation = "stand-right";
                break;

            case WalkDirection.Left:
                walkOffset.X = -1 * 1;
                animation = "walk-left";
                idleAnimation = "stand-left";
                break;

            case WalkDirection.Up:
                walkOffset.Y = -1 * 1;
                animation = "walk-up";
                idleAnimation = "stand-up";
                break;

            case WalkDirection.Down:
                walkOffset.Y = 1;
                animation = "walk-down";
                idleAnimation = "stand";
                break;

        }


        this.animation.playAnimation(npc.GUID, idleAnimation);
        

        var target = {
            X: npc.Position.X + walkOffset.X,
            Y: npc.Position.Y + walkOffset.Y
        };

        //this.gameHandler.log("Want to move to: ", target);
        //this.gameHandler.log("Play Animation: ", animation);

        if (this.gameHandler.isCoordPassable(target.X, target.Y))
        {
            var offsetPerUpdate = (1 / npc.Speed) / this.updatesPerSecond;
            var intervall = (1 / this.updatesPerSecond) * 1000; // 1 sec / updatesPerSecond

            npc.Target = target;
            npc.Direction = direction;

            npc.State = PlayerState.Walking;

            // Start Animation:
            
            this.animation.playAnimation(npc.GUID, animation);
            

            var self = this;
            this.positionUpdateStep(npc, direction, offsetPerUpdate, intervall, function ()
            {
                self.moveFinishedCallback(npc);

                if (callback !== undefined)
                {
                    callback();
                }
            });
        }
        else
        {
            this.gameHandler.log("Target not passable: ", target);
            npc.State = PlayerState.Standing;

        }
    }

    /* Movement Handler */

    private moveFinishedCallback(npc: NPCData)
    {
        var animation = "stand";

        switch (npc.Direction)
        {
            case WalkDirection.Right:
                animation = "stand-right";
                
                break;

            case WalkDirection.Left:
                animation = "stand-left";

                break;

            case WalkDirection.Up:
                animation = "stand-up";

                break;

            case WalkDirection.Down:
                animation = "stand";

                break;

        }

        this.animation.playAnimation(npc.GUID, animation);
        npc.State = PlayerState.Standing;

    }

    private positionUpdateStep(npc: NPCData, direction: WalkDirection, offsetPerUpdate: number, intervall: number, callback?: (npc: NPCData) => any)
    {
        var walkOffset = {
            X: 0,
            Y: 0
        };

        switch (direction)
        {
            case WalkDirection.Right:
                walkOffset.X = offsetPerUpdate;
                break;

            case WalkDirection.Left:
                walkOffset.X = -1 * offsetPerUpdate;
                break;

            case WalkDirection.Up:
                walkOffset.Y = -1 * offsetPerUpdate;
                break;

            case WalkDirection.Down:
                walkOffset.Y = offsetPerUpdate;
                break;

        }

        //self.gameHandler.log("Walk Offset: ", walkOffset);

        var newPosition = {
            X: npc.Position.X + walkOffset.X,
            Y: npc.Position.Y + walkOffset.Y
        };

        var normalizedPosition = {
            X: Math.round(newPosition.X),
            Y: Math.round(newPosition.Y)
        };

        if (
            (((direction == WalkDirection.Right) && (newPosition.X > npc.Target.X)) ||
            ((direction == WalkDirection.Left) && (newPosition.X < npc.Target.X)) ||
            ((direction == WalkDirection.Up) && (newPosition.Y < npc.Target.Y)) ||
            ((direction == WalkDirection.Down) && (newPosition.Y > npc.Target.Y))))
        {
            this.setPosition(npc.ID, normalizedPosition);

            //self.gameHandler.eventHandler.callEvent("PlayerPositionChanged", this, normalizedPosition);
            //console.log("Movement done!");

            if (callback !== undefined)
            {
                callback(npc);
            }

        }
        else
        {
            this.setPosition(npc.ID, newPosition);

            //console.log("Position updated: ", newPosition);

            var self = this;

            window.setTimeout(function ()
            {
                self.positionUpdateStep(npc, direction, offsetPerUpdate, intervall, callback);
            }, intervall);
        }


    }

}