/// <reference path="jquery.d.ts" />

interface EventData
{
    callbacks:
    {
        (sender: any, arguments: any): void;
    }[]
}


class EventHandler
{
    private events: { [id: string]: EventData } = {};
    private calledEvents: string[] = [];

    private timedEvents: {
        [id: string]: {
            run: boolean;
            callback: (sender: any, arguments: any) => void;
        }
    } = {};

    public addEventListener(event: string, callback: () => void)
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
        //console.log("Event Called: ", event);

        if ((this.events === undefined) || (this.events[event] === undefined))
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
