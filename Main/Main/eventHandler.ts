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
            callback: (sender: any, args: any) => void;
            control: string;
            timeout: number;
            lastTick: number;
            sender: any;
            args: any;
        }
    } = {};

    constructor(gameHandler: GameHandler)
    {
        this.gameHandler = gameHandler;
        gameHandler.setEventHandler(this);

        this.addTimedTrigger("internal_Heartbeat", "TimerHeartbeat", 500, this);
        this.addEventListener("TimerHeartbeat", (s, a) =>
        {
            $.each(this.timedEvents, (id, data) =>
            {
                var time = Date.now() - data.lastTick;

                if (data.run === true && time > (data.timeout * 2) && time > 200)
                {
                    console.warn("Timer '" + id + "' seems to have crashed! Restart ...");
                    console.log("Timer was not active for: " + time + " ms");

                    var control = Math.random().toString();
                    this.timedEvents[id].control = control;
                    
                    window.setTimeout(() =>
                    {
                        this.triggerEvent(id, control);
                    }, 1);
                }
            });
        });

    }


    public addEventListener(event: string, callback: (sender: any, args: any) => void)
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

    public callEvent(event: string, sender: any, args: any)
    {
        this.addEventToList(event);

        var unheared = ((this.events === undefined) || (this.events[event] === undefined));

        if (this.gameHandler.config.verbose)
        {
            console.log("Event Called: ", { name: event, sender: sender, arguments: args, heared: !unheared });
        }


        if (unheared)
        {
            //console.warn("EventHandler - No Event called '" + event + "' found!");

            return false;
        }

        for (var i = 0; i < this.events[event].callbacks.length; i++)
        {
            this.events[event].callbacks[i](sender, args);
        }
    }

    public getEvents(): string[]
    {
        return Object.keys(this.events).concat(this.calledEvents);
    }

    public containesKey(index: string): boolean
    {
        return (this.getEvents().indexOf(index) !== -1);
    }

    public addTimer(name: string, callback: (sender: any, args: any) => void, timeout: number, sender?: any, args?: any)
    {
        if (this.timedEvents[name] !== undefined)
        {
            this.stopTimer(name);
        }

        var control = Math.random().toString();

        this.timedEvents[name] = {
            run: true,
            callback: callback,
            control: control,
            timeout: timeout,
            lastTick: Number.MAX_VALUE,
            sender: sender,
            args: args
        };


        this.callEvent("TaskCreated", self, "Timer - " + name);
        window.setTimeout(() => { this.triggerEvent(name, control); }, timeout);
    }


    private triggerEvent(name: string, control: string)
    {
        try
        {

            var data = this.timedEvents[name];

            if (control !== data.control)
            {
                // Wrong Context for Timer: kill current Event
                this.callEvent("TaskDisposed", self, "Timer - " + name);
                console.info("Stopping Timer '" + name + "': Wrong Context", control, data.control);

                return;
            }

            if ((data !== undefined) && (data.run))
            {
                data.lastTick = Date.now();

                data.callback(data.sender, data.args);

                this.callEvent("TaskCreated", self, "Timer - " + name);

                window.setTimeout(() => { this.triggerEvent(name, control); }, data.timeout);
            }
            else
            {
                delete this.timedEvents[name];
            }

        }
        catch (ex)
        {
            this.gameHandler.warn("Exception while executing timed Trigger '" + name + "': ", ex);
            delete this.timedEvents[name];
        }
        this.callEvent("TaskDisposed", this, "Timer - " + name);
    }


    public addTimedTrigger(name: string, triggerEvent: string, intervall: number, sender?: any, args?: any)
    {
        var self = this;
        var callback = function (sender, args)
        {
            self.callEvent(triggerEvent, sender, args);
        };

        this.addTimer(name, callback, intervall, sender, args);
    }

    public stopTimer(name: string)
    {
        if (this.timedEvents[name] !== undefined)
        {
            this.timedEvents[name].run = false;
        }
    }

    private addEventToList(name: string)
    {
        if (this.calledEvents.indexOf(name) === -1)
        {
            this.calledEvents.push(name);
        }

    }

}
