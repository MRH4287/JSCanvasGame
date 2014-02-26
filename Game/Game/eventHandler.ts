/// <reference path="jquery.d.ts" />
/// <reference path="animationHandler.ts" />
/// <reference path="gameHandler.ts" />
/// <reference path="interfaces.ts" />


class EventHandler
{
    private events: { [id: string]: EventData } = {};
    private calledEvents: string[] = [];

    private gameHandler: GameHandler = null;

    private timedEvents: {
        [id: string]: {
            run: boolean;
            callback: (sender: any, arguments: any) => void;
        }
    } = {};

    constructor(gameHandler: GameHandler)
    {
        this.gameHandler = gameHandler;
        gameHandler.setEventHandler(this);
    }


    public addEventListener(event: string, callback: (sender: any, arguments: any) => void)
    {
        if (this.events === undefined)
        {
            this.events = {};
        }

        if (this.events[event] === undefined)
        {
            this.events[event] = {
                callbacks: []
            };
        }

        this.events[event].callbacks.push(callback);
    }

    public callEvent(event: string, sender: any, arguments: any)
    {
        this.calledEvents.push(event);

        var unheared = ((this.events === undefined) || (this.events[event] === undefined));

        if (this.gameHandler.config.verbose)
        {
            console.log("Event Called: ", { name: event, sender: sender, arguments: arguments, heared: !unheared });
        }


        if (unheared)
        {
            //console.warn("EventHandler - No Event called '" + event + "' found!");

            return false;
        }

        for (var i = 0; i < this.events[event].callbacks.length; i++)
        {
            this.events[event].callbacks[i](sender, arguments);
        }
    }

    public getEvents(): string[]
    {
        return Object.keys(this.events).concat(this.calledEvents);
    }

    public containesKey(index: string): boolean
    {
        return (this.getEvents().indexOf(index) != -1);
    }

    public addTimer(name: string, callback: (sender: any, arguments: any) => void, intervall: number, sender?: any, arguments?: any)
    {

        this.timedEvents[name] = {
            run: true,
            callback: callback
        }

        var self = this;
        var triggerEvent = function ()
        {
            var data = self.timedEvents[name];

            if (data.run)
            {
                data.callback(sender, arguments);

                window.setTimeout(triggerEvent, intervall);
            }
            else
            {
                delete self.timedEvents[name];
            }
        };

        window.setTimeout(triggerEvent, intervall);
    }


    public addTimedTrigger(name: string, triggerEvent: string, intervall: number, sender?: any, arguments?: any)
    {
        var self = this;
        var callback = function (sender, arguments)
        {
            self.callEvent(triggerEvent, sender, arguments);
        };

        this.addTimer(name, callback, intervall, sender, arguments);
    }

    public stopTimer(name: string)
    {
        if (this.timedEvents[name] !== undefined)
        {
            this.timedEvents[name].run = false;
        }
    }
}
