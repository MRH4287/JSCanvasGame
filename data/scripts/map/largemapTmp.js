//This is a test Script file ...


var playerPosition = loader.playerPosition;

var ABORT = false;
var self = this;

gameHandler.eventHandler.addEventListener("preLevelChange", function(s, arg)
{
    ABORT = true;
    gameHandler.pathHandler.stopAllMovements();
    
});


/*
window.setTimeout(function () {

    gameHandler.pathHandler.moveNPC("test", { X: playerPosition.X + 1, Y: playerPosition.Y + 10 }, true);

}, 3000);
*/

gameHandler.npcManager.addNPC("pikachu1", {X: 36, Y: 8}, "pikachu", "stand", 0.8);

gameHandler.npcManager.addNPC("pichu3", { X: 37, Y: 8 }, "pichu", "stand-up", 0.8);


var pichuloop = false;

gameHandler.eventHandler.addEventListener("PlayerNPCAction", function (s, args)
{
    if (ABORT)
    {
        return;
    }

    var containerName = args.animationData.AnimationContainer.ID;
    console.log("You interacted with a '" + containerName + "'!");

    if (containerName == "pichu")
    {
        loader.playSound("sound/pichu!.ogg");
    }

    if (args.name == "pikachu1")
    {
        gameHandler.npcManager.renderSpeechBubble("pikachu1", "Those two love to play!", 4);
    }

    if (args.name == "pichu3" && !pichuloop)
    {
        pichuloop = true;

        gameHandler.npcManager.setAnimation("pichu3", "stand-left");
        gameHandler.npcManager.setAnimation("pikachu1", "stand-right");
        gameHandler.npcManager.renderSpeechBubble("pichu3", "I want to play too!", 2);
        window.setTimeout(function ()
        {
            if (ABORT)
            {
                return;
            }

            gameHandler.npcManager.renderSpeechBubble("pikachu1", "You are to young to play with your brothers.", 2);

            window.setTimeout(function ()
            {
                if (ABORT)
                {
                    return;
                }

                gameHandler.npcManager.renderSpeechBubble("pichu3", "Awww!", 2);

                window.setTimeout(function ()
                {
                    if (ABORT)
                    {
                        return;
                    }

                    gameHandler.npcManager.setAnimation("pichu3", "stand-up");
                    gameHandler.npcManager.setAnimation("pikachu1", "stand");
                    pichuloop = false;

                }, 3000);

            }, 3000);


        }, 3000);
    }

});


var pichu1Pos = { X: 36, Y: 4 };
gameHandler.npcManager.addNPC("pichu1", pichu1Pos, "pichu", "stand", 0.8);

text = [
"HIHI!",
"I'll get you!",
"Stand still!",
"Hehe!",
"Hey! No Sparks!"
];


var stateP1 = 0;
function moveCallbackP1()
{
    if (ABORT)
    {
        return;
    }

    var pos = null;

    switch (stateP1)
    {
        case 0:
            pos = { X: pichu1Pos.X, Y: pichu1Pos.Y + 2 };
            break;

        case 1:
            pos = { X: pichu1Pos.X + 2, Y: pichu1Pos.Y + 2 };
            break;

        case 2:
            pos = { X: pichu1Pos.X + 2, Y: pichu1Pos.Y };
            break;

        case 3:
            pos = pichu1Pos;
            break;

    }

    gameHandler.pathHandler.moveNPC("pichu1", pos, false, function ()
    {
        window.setTimeout(function ()
        {
            moveCallbackP1();
        }, 10);
    });

    var npcText = text[ Math.floor( Math.random() * 10 ) % 5];
    gameHandler.npcManager.renderSpeechBubble("pichu1", npcText, 0.3);

    stateP1++;
    if (stateP1 >= 4)
    {
        stateP1 = 0;
    }
}


var pichu2Pos = { X: 38, Y: 6 };
gameHandler.npcManager.addNPC("pichu2", pichu2Pos, "pichu", "stand", 0.8);

var stateP2 = 0;
function moveCallbackP2()
{
    if (ABORT)
    {
        return;
    }

    var pos = null;

    switch (stateP2)
    {
        case 0:
            pos = { X: pichu2Pos.X , Y: pichu2Pos.Y -2 };
            break;

        case 1:
            pos = { X: pichu2Pos.X - 2, Y: pichu2Pos.Y - 2 };
            break;

        case 2:
            pos = { X: pichu2Pos.X - 2, Y: pichu2Pos.Y};
            break;

        case 3:
            pos = pichu2Pos;
            break;

    }

    gameHandler.pathHandler.moveNPC("pichu2", pos, false, function ()
    {
        window.setTimeout(function ()
        {
            moveCallbackP2();
        }, 10);
    });

    var npcText = text[ Math.floor( Math.random() * 10 ) % 5];
    gameHandler.npcManager.renderSpeechBubble("pichu2", npcText, 0.3);

    stateP2++;
    if (stateP2 >= 4)
    {
        stateP2 = 0;
    }
}


moveCallbackP1();
moveCallbackP2();




