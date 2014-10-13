/// <reference path="gameHandler.ts" />

class JavaScriptHandler 
{
    private gameHandler: GameHandler;
    private basePath = "data/scripts/";

    private mapPathReg: RegExp = new RegExp("data/([^\.]+)\.json");

    constructor(gameHandler: GameHandler)
    {
        this.gameHandler = gameHandler;

        var self = this;

        this.gameHandler.eventHandler.addEventListener("postMapLoad", function (s, arg)
        {
            var mapPathResult = self.mapPathReg.exec(self.gameHandler.config.mapPath);
            var scriptPath = "map/" + mapPathResult[1] + ".js";

            self.gameHandler.log("Try to load ScriptFile: ", self.basePath + scriptPath);
            self.includeIfExist(scriptPath);
        });

    }



    public getScriptFile(path: string, appendBasePath = true)
    {
        if (appendBasePath)
        {
            path = this.basePath + path;
        }

        return this.gameHandler.getFile(path, undefined, "text");
    }

    public includeIfExist(path: string, appendBasePath = true)
    {
        var self = this;

        if (appendBasePath)
        {
            path = this.basePath + path;
        }

        $.ajax({
            url: path,
            type: "HEAD",
            error: function ()
            {
                self.gameHandler.log("File do not exist. Ignore. ", path);
            },
            success: function ()
            {
                self.gameHandler.log("Map-Script found. Include.", path);

                self.include(path, false);
            }
        });
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
