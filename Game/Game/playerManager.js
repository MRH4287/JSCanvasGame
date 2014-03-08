/// <reference path="jquery.d.ts" />
/// <reference path="eventHandler.ts" />
/// <reference path="interfaces.ts" />
/// <reference path="animationHandler.ts" />
var PlayerState;
(function (PlayerState) {
    PlayerState[PlayerState["Standing"] = 0] = "Standing";
    PlayerState[PlayerState["Walking"] = 1] = "Walking";
})(PlayerState || (PlayerState = {}));

var WalkDirection;
(function (WalkDirection) {
    WalkDirection[WalkDirection["Up"] = 0] = "Up";
    WalkDirection[WalkDirection["Down"] = 1] = "Down";
    WalkDirection[WalkDirection["Left"] = 2] = "Left";
    WalkDirection[WalkDirection["Right"] = 3] = "Right";
})(WalkDirection || (WalkDirection = {}));

var PlayerManager = (function () {
    function PlayerManager(gameHandler, animationHandler) {
        this.position = {
            X: 0,
            Y: 0
        };
        this.playerElementName = "player";
        this.playerState = 0 /* Standing */;
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
        this.Keys = {
            up: 38,
            left: 37,
            right: 39,
            down: 40,
            action: 13
        };
        this.gameHandler = gameHandler;
        this.playerAnimation = animationHandler;

        var self = this;
        this.gameHandler.eventHandler.addEventListener("postInit", function (s, e) {
            self.init();
        });
    }
    PlayerManager.prototype.init = function () {
        var self = this;

        // Add Player to the Game:
        this.position.X = 6;
        this.position.Y = 6;

        this.initPlayer(self);

        // Bind Events here .. etc.
        $(document).keydown(function (event) {
            self.playerAnimation.stopAnimation(self.playerElementName);

            switch (event.keyCode) {
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
    };

    PlayerManager.prototype.initPlayer = function (self) {
        self.gameHandler.loadAnimation("data/animations/pichu.json");
        self.playerAnimation.addAnimation(this.playerElementName, "pichu", "stand", this.position.X, this.position.Y);
    };
    return PlayerManager;
})();
