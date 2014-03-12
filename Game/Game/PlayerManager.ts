/// <reference path="jquery.d.ts" />
/// <reference path="eventHandler.ts" />
/// <reference path="interfaces.ts" />
/// <reference path="animationHandler.ts" />

enum PlayerState
{
    Standing, Walking
}

enum WalkDirection
{
    Up, Down, Left, Right, None
}

class PlayerManager
{

    private playerAnimation: AnimationHandler;
    private gameHandler: GameHandler;

    private position =
    {
        X: 0,
        Y: 0
    }

    private targetPosition =
    {
        X: 0,
        Y: 0
    }

    private playerSpeed: number = 0.5;
    private updatesPerSecond: number = 10;


    private playerElementName: string = "player";
    private playerState: PlayerState = PlayerState.Standing;
    private moveDirection: WalkDirection = WalkDirection.None;


   // Keycodes:
    /*
        39 - right
        37 - left
        38 - up
        40 - down
        13 - return
        32 - space
        27 - escape
    */
    public Keys =
    {
        up: 38,
        left: 37,
        right: 39,
        down: 40,
        action: 13


    }

    private KeysDown: { [index: number]: boolean } = {};


    constructor(gameHandler: GameHandler, animationHandler: AnimationHandler)
    {
        this.gameHandler = gameHandler;
        this.playerAnimation = animationHandler;

        var self = this;
        this.gameHandler.eventHandler.addEventListener("postInit", function (s, e)
        {
            self.init();
        });


    }

    public test()
    {
        this.initMove(WalkDirection.Right);
        //this.initMove(WalkDirection.Left);
        //this.initMove(WalkDirection.Up);
        //this.initMove(WalkDirection.Down);

    }

    private initMove(direction: WalkDirection, initialCall: boolean = true, callback?: () => any)
    {
        if ((this.playerState == PlayerState.Walking) && initialCall)
        {
            this.gameHandler.log("Player is already walking");
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

        if (initialCall)
        {
            this.playerAnimation.playAnimation(this.playerElementName, idleAnimation, "");
        }

        var target = {
            X: this.position.X + walkOffset.X,
            Y: this.position.Y + walkOffset.Y
        };

        //this.gameHandler.log("Want to move to: ", target);
        //this.gameHandler.log("Play Animation: ", animation);

        if (this.gameHandler.isCoordPassable(target.X, target.Y))
        {
            var offsetPerUpdate = (1 / this.playerSpeed) / this.updatesPerSecond;
            var intervall = (1 / this.updatesPerSecond) * 1000; // 1 sec / updatesPerSecond

            this.targetPosition = target;
            this.moveDirection = direction;

            this.playerState = PlayerState.Walking;

            // Start Animation:
            if (initialCall)
            {
                this.playerAnimation.playAnimation(this.playerElementName, animation, "");
            }

            var self = this;
            this.positionUpdateStep(this, direction, offsetPerUpdate, intervall, function ()
            {
                self.moveFinishedCallback();

                if (callback !== undefined)
                {
                    callback();
                }
            });
        }
        else
        {
            this.gameHandler.log("Target not passable: ", target);
            this.playerState = PlayerState.Standing;

        }
    }


    private moveFinishedCallback()
    {
        var animation = "stand";

        var walkAgain = false;

        switch (this.moveDirection)
        {
            case WalkDirection.Right:
                animation = "stand-right";
                walkAgain = this.keyDown(this.Keys.right);
                break;

            case WalkDirection.Left:
                animation = "stand-left";
                walkAgain = this.keyDown(this.Keys.left);
                break;

            case WalkDirection.Up:
                animation = "stand-up";
                walkAgain = this.keyDown(this.Keys.up);
                break;

            case WalkDirection.Down:
                animation = "stand";
                walkAgain = this.keyDown(this.Keys.down);
                break;

        }

        if (!walkAgain)
        {
            this.playerAnimation.playAnimation(this.playerElementName, animation, "");
            this.playerState = PlayerState.Standing;
        }
        else
        {
            this.initMove(this.moveDirection, false);
        }   
    }


    private positionUpdateStep(self: PlayerManager, direction: WalkDirection, offsetPerUpdate: number, intervall: number, callback?: () => any)
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
            X: self.position.X + walkOffset.X,
            Y: self.position.Y + walkOffset.Y
        };

        var normalizedPosition = {
            X: Math.round(newPosition.X),
            Y: Math.round(newPosition.Y)
        };

        if ( //((normalizedPosition.X == self.targetPosition.X) && (normalizedPosition.Y == self.targetPosition.Y)) ||
            (((direction == WalkDirection.Right) && (newPosition.X > self.targetPosition.X)) ||
            ((direction == WalkDirection.Left) && (newPosition.X < self.targetPosition.X)) ||
            ((direction == WalkDirection.Up) && (newPosition.Y < self.targetPosition.Y)) ||
            ((direction == WalkDirection.Down) && (newPosition.Y > self.targetPosition.Y))))
        {
            self.position = normalizedPosition;
            self.playerAnimation.setPosition(self.playerElementName, normalizedPosition.X, normalizedPosition.Y);
            //console.log("Movement done!");

            if (callback !== undefined)
            {
                callback();
            }

        }
        else
        {
            self.position = newPosition;
            self.playerAnimation.setPosition(self.playerElementName, newPosition.X, newPosition.Y);
            //console.log("Position updated: ", newPosition);

            window.setTimeout(function ()
            {
                self.positionUpdateStep(self, direction, offsetPerUpdate, intervall, callback);
            }, intervall);
        }


    }

    public init()
    {
        var self = this;

        // Add Player to the Game:
        this.position.X = 6;
        this.position.Y = 6;

        this.initPlayer(self);

        $(document).keydown(function (event)
        {
            self.KeysDown[event.keyCode] = true;

            self.gameHandler.eventHandler.callEvent("PlayerManagerInputCheck", self, null);
        })
            .keyup(function (event)
            {
                self.KeysDown[event.keyCode] = false;
            });

        this.gameHandler.eventHandler.addTimedTrigger("playerManagerInputCheck", "PlayerManagerInputCheck", 500, this, null);

        this.gameHandler.eventHandler.addEventListener("PlayerManagerInputCheck", function (sender, args)
        {
            //self.gameHandler.log("Check for Input ...", self.KeysDown);

            if (self.playerState == PlayerState.Standing)
            {
                if (self.keyDown(self.Keys.up))
                {
                    self.initMove(WalkDirection.Up);
                }
                else if (self.keyDown(self.Keys.down))
                {
                    self.initMove(WalkDirection.Down);
                }
                else if (self.keyDown(self.Keys.left))
                {
                    self.initMove(WalkDirection.Left);
                }
                else if (self.keyDown(self.Keys.right))
                {
                    self.initMove(WalkDirection.Right);
                }
                else if (self.keyDown(self.Keys.action))
                {
                    self.playerAnimation.playAnimation(self.playerElementName, "sleep", "");
                }

            }
        });



    }

    private keyDown(key: number): boolean
    {
        var value = this.KeysDown[key];


        return ((value !== undefined) && (value));
    }

    private initPlayer(self: PlayerManager)
    {
        self.gameHandler.loadAnimation("data/animations/pichu.json");
        self.playerAnimation.addAnimation(this.playerElementName, "pichu", "stand", this.position.X, this.position.Y);

    }



}