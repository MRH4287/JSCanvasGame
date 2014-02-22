/// <reference path="jquery.d.ts" />

class GameHandler
{
    public config =
    {
        debug: true
    };


    // Global Helper Functions:
    public getFile(url: string, callback: (any) => void, dataType?: string)
    {
        var async = (!(typeof (callback) == "undefined"));
        dataType = (typeof (dataType) == "undefined") ? "json" : dataType;

        var tempResult = null;

        $.ajax({
            dataType: dataType,
            url: url,
            success: function (result)
            {
                if (async)
                {
                    callback(result);
                }
                else
                {
                    tempResult = result;
                }

            },
            async: async
        });


        return tempResult;
    }

    public log(message: any, objects: any)
    {
        if (this.config.debug)
        {
            console.log(message, objects);
        }
    }

    public info(message: any, objects: any)
    {
        if (this.config.debug)
        {
            console.info(message, objects);
        }
    }

    public warn(message: any, objects: any)
    {
        if (this.config.debug)
        {
            console.warn(message, objects);
        }
    }

    public error(message: any, objects: any)
    {
        if (this.config.debug)
        {
            console.error(message, objects);
        }
    }


}