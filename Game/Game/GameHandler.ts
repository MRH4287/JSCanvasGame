/// <reference path="jquery.d.ts" />

class GameHandler
{
    public config =
    {
        debug: true
    };


    // Global Helper Functions:
    public getFile(url: string, callback?: (any) => void, dataType?: string): any
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

    public log(message?: any, ...optionalParams: any[]): void
    {
        if (this.config.debug)
        {
            console.log(message, optionalParams);
        }
    }

    public info(message?: any, ...optionalParams: any[]): void
    {
        if (this.config.debug)
        {
            console.info(message, optionalParams);
        }
    }

    public warn(message?: any, ...optionalParams: any[]): void
    {
        if (this.config.debug)
        {
            console.warn(message, optionalParams);
        }
    }

    public error(message?: any, ...optionalParams: any[]): void
    {
        if (this.config.debug)
        {
            console.error(message, optionalParams);
        }
    }


}