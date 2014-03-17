/// <reference path="jquery.d.ts" />
/// <reference path="animationHandler.ts" />
/// <reference path="gameHandler.ts" />
/// <reference path="interfaces.ts" />
var EventHandler = (function () {
    function EventHandler(gameHandler) {
        this.events = {};
        this.calledEvents = [];
        this.gameHandler = null;
        this.timedEvents = {};
        this.gameHandler = gameHandler;
        gameHandler.setEventHandler(this);
    }
    EventHandler.prototype.addEventListener = function (event, callback) {
        if (this.events === undefined) {
            this.events = {};
        }

        if (this.events[event] === undefined) {
            this.events[event] = {
                callbacks: []
            };
        }

        this.events[event].callbacks.push(callback);
    };

    EventHandler.prototype.callEvent = function (event, sender, arguments) {
        this.addEventToList(event);

        var unheared = ((this.events === undefined) || (this.events[event] === undefined));

        if (this.gameHandler.config.verbose) {
            console.log("Event Called: ", { name: event, sender: sender, arguments: arguments, heared: !unheared });
        }

        if (unheared) {
            //console.warn("EventHandler - No Event called '" + event + "' found!");
            return false;
        }

        for (var i = 0; i < this.events[event].callbacks.length; i++) {
            this.events[event].callbacks[i](sender, arguments);
        }
    };

    EventHandler.prototype.getEvents = function () {
        return Object.keys(this.events).concat(this.calledEvents);
    };

    EventHandler.prototype.containesKey = function (index) {
        return (this.getEvents().indexOf(index) != -1);
    };

    EventHandler.prototype.addTimer = function (name, callback, intervall, sender, arguments) {
        if (this.timedEvents[name] !== undefined) {
            this.stopTimer(name);
        }

        this.timedEvents[name] = {
            run: true,
            callback: callback
        };

        var self = this;
        var triggerEvent = function () {
            self.callEvent("TaskCreated", self, "Timer");

            var data = self.timedEvents[name];

            if ((data !== undefined) && (data.run)) {
                data.callback(sender, arguments);

                window.setTimeout(triggerEvent, intervall);
            } else {
                delete self.timedEvents[name];
            }

            self.callEvent("TaskDisposed", self, "Timer");
        };

        window.setTimeout(triggerEvent, intervall);
    };

    EventHandler.prototype.addTimedTrigger = function (name, triggerEvent, intervall, sender, arguments) {
        var self = this;
        var callback = function (sender, arguments) {
            self.callEvent(triggerEvent, sender, arguments);
        };

        this.addTimer(name, callback, intervall, sender, arguments);
    };

    EventHandler.prototype.stopTimer = function (name) {
        if (this.timedEvents[name] !== undefined) {
            this.timedEvents[name].run = false;
        }
    };

    EventHandler.prototype.addEventToList = function (name) {
        if (this.calledEvents.indexOf(name) == -1) {
            this.calledEvents.push(name);
        }
    };
    return EventHandler;
})();
