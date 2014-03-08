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
    Up, Down, Left, Right
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

    private playerElementName: string = "player";
    private playerState: PlayerState = PlayerState.Standing;


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


    public init()
    {
        var self = this;

        // Add Player to the Game:
        this.position.X = 6;
        this.position.Y = 6;

        this.initPlayer(self);


        // Bind Events here .. etc.
        $(document).keydown(function (event)
        {


            self.playerAnimation.stopAnimation(self.playerElementName);

            switch (event.keyCode)
            {
                case self.Keys.up:
                    self.playerAnimation.playAnimation(self.playerElementName, "stand-up", "");
                    break;

                case self.Keys.right:
                    self.playerAnimation.playAnimation(self.playerElementName, "stand-right", "");
                    break;

                case self.Keys.down:
                    self.playerAnimation.playAnimation(self.playerElementName, "stand", "");
                    break;

                case self.Keys.left:
                    self.playerAnimation.playAnimation(self.playerElementName, "stand-left", "");
                    break;

                case self.Keys.action:
                    self.playerAnimation.playAnimation(self.playerElementName, "sleep", "");
                    break;


            }

        });


    }

    private initPlayer(self: PlayerManager)
    {
        self.gameHandler.loadAnimation("data/animations/pichu.json");
        self.playerAnimation.addAnimation(this.playerElementName, "pichu", "stand", this.position.X, this.position.Y);

    }



}