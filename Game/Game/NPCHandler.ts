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
            // Check if an NPC is standing on this position

            $.each(self.npcList, function (id: string, data: NPCData)
            {
                if ((data.Position.X == argument.X) && (data.Position.Y == argument.Y))
                {
                    argument.result = false;
                }
            });
        });

        this.gameHandler.eventHandler.addEventListener("PlayerAction", function (s, argument)
        {
            $.each(self.npcList, function (id: string, data: NPCData)
            {
                if ((data.Position.X == argument.X) && (data.Position.Y == argument.Y))
                {
                    self.gameHandler.eventHandler.callEvent("PlayerNPCAction", self, {
                        name: id,
                        X: argument.X,
                        Y: argument.Y
                    });
                }
            });



        });

        self.gameHandler.eventHandler.callEvent("TaskCreated", self, "NPC - Constructor");
        window.setTimeout(function ()
        {
            self.gameHandler.eventHandler.callEvent("npcInit", self, null);

            self.gameHandler.eventHandler.callEvent("TaskDisposed", self, "NPC - Constructor");
        }, 100);

        

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
            State: PlayerState.Standing,
            DisplaySpeechBubbleTo: undefined           
        };

        this.npcList[name] = data;

        // Start default Animation for Element:
        this.animation.addAnimation(data.GUID, animationContainer, defaultAnimation, position.X, position.Y);


        var self = this;
        this.gameHandler.eventHandler.addTimedTrigger("NPCSpeechBubbleCheck", "NPCSpeechBubbleCheck", 1000, this, null); 
        this.gameHandler.eventHandler.addEventListener("NPCSpeechBubbleCheck", function ()
        {
            $.each(self.npcList, function (name: string, data: NPCData)
            {
                if (data.DisplaySpeechBubbleTo !== undefined)
                {
                    if (data.DisplaySpeechBubbleTo < Date.now())
                    {
                        self.removeSpeechBubble(name);
                        data.DisplaySpeechBubbleTo = undefined;
                    }
                }

            });
        });

    }

    public removeNPC(name: string)
    {
        if (this.npcList[name] === undefined)
        {
            this.gameHandler.error("No NPC with this ID found!", name);
            return;
        }

        this.animation.stopAnimation(this.npcList[name].GUID);
        delete this.npcList[name];
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


    public renderSpeechBubble(name: string, message: string, timeout: number = 5)
    {
        if (this.npcList[name] === undefined)
        {
            this.gameHandler.error("No NPC with this ID found!", name);
            return;
        }

        var npc = this.npcList[name];

        var nameTagName = "NPCSpeechBubble-" + name;
        var handler = this.animation;

        var textLength = 5 * message.length + 15;
        var height = 11;

        var textOffset = 5;

        var position = npc.Position;

        var offsetX = 0;
        if (textLength > this.gameHandler.config.tileSize)
        {
            offsetX = (textLength - this.gameHandler.config.tileSize) / 2
        }

        var Coord = {
            X: (position.X - 1) * this.gameHandler.config.tileSize - offsetX,
            Y: (position.Y - 1.8) * this.gameHandler.config.tileSize
        };

        //console.log(position);
        //console.log(Coord);

        npc.DisplaySpeechBubbleTo = Date.now() + timeout * 1000;

        handler.drawColorRect(nameTagName, Coord.X, Coord.Y, textLength, height, 255, 255, 255, 0.3, false);
        handler.writeText(nameTagName + "-text", message, Coord.X + textLength / 2, Coord.Y, "11px sans-serif", "top", "center", "rgba(0,0,0,1)", textLength - 2 * textOffset, false);

    }


    private removeSpeechBubble(name: string)
    {
        var nameTagName = "NPCSpeechBubble-" + name;
        var handler = this.animation;

        handler.removeGenericDraw(nameTagName);
        handler.removeGenericDraw(nameTagName + "-text");
    }


    public setPosition(name: string, position: { X: number; Y: number }, rerender = true)
    {
        if (this.npcList[name] === undefined)
        {
            this.gameHandler.error("No NPC with this ID found!", name);
            return;
        }

        this.npcList[name].Position = position;
        this.animation.setPosition(this.npcList[name].GUID, position.X, position.Y, rerender);
    }

    public NPCMotionStop(name: string)
    {
        if (this.npcList[name] === undefined)
        {
            this.gameHandler.error("No NPC with this ID found!", name);
            return;
        }

        this.npcList[name].State = PlayerState.Standing;
    }

    public advInitMove(name: string, position: { X: number; Y: number }, direction: WalkDirection, speed: number, callback?: () => any, ignoreChecks: boolean = false)
    {


        var npc: NPCData = this.npcList[name];

        if ((npc.State == PlayerState.Walking) && (!ignoreChecks))
        {
            this.gameHandler.log("NPC is already walking", npc);
            return;
        }

        this.setPosition(name, position);
        npc.Speed = speed;
        this.initMove(name, direction, callback, ignoreChecks);


    }


    public initMove(name: string, direction: WalkDirection, callback?: () => any, ignoreChecks: boolean = false)
    {
        if (this.npcList[name] === undefined)
        {
            this.gameHandler.error("No NPC with this ID found!", name);
            return;
        }

        var npc: NPCData = this.npcList[name];

        if ((npc.State == PlayerState.Walking) && (!ignoreChecks))
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
        if (npc.State == PlayerState.Standing)
        {
            return;
        }

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

            self.gameHandler.eventHandler.callEvent("TaskCreated", self, "NPC - PlayerPositonUpdateStep");
            window.setTimeout(function ()
            {

                self.positionUpdateStep(npc, direction, offsetPerUpdate, intervall, callback);

                self.gameHandler.eventHandler.callEvent("TaskDisposed", self, "NPC - PlayerPositonUpdateStep");
            }, intervall);
        }


    }

}