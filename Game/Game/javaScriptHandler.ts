/// <reference path="gameHandler.ts" />

class JavaScriptHandler 
{
    private gameHandler: GameHandler;
    private basePath = "data/scripts/";

    constructor(gameHandler: GameHandler)
    {
        this.gameHandler = gameHandler;
    }

    public getScriptFile(path: string, appendBasePath = true)
    {
        if (appendBasePath)
        {
            path = this.basePath + path;
        }

        return this.gameHandler.getFile(path, undefined, "text");
    }

    public include(path: string, appendBasePath = true)
    {
        var script = this.getScriptFile(path, appendBasePath);
        this.run(script);
    }

    private run(script: string)
    {
        try
        {
            var func = new Function("gameHandler, loader", script);

            func(this.gameHandler, this);
        }
        catch (ex)
        {
            console.error("Error while executing Script file: ", ex);
        }
    }

    public playSound(path: string)
    {
        var audio = new Audio(path);
        audio.play();
    }

    get playerPosition()
    {
        return this.gameHandler.playerManager.getPosition();
    }

}
