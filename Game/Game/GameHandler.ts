/// <reference path="jquery.d.ts" />
/// <reference path="eventHandler.ts" />
/// <reference path="interfaces.ts" />

class GameHandler
{
    public config =
    {
        debug: true,
        width: 800,
        height: 300,
        tileSize: 25,
        elementsPath: "data/elements.json",
        mapPath: "data/map2.json",
        showBlocking: true,
        verbose: false
    };

    public map: Tile[][];
    public elements: { [id: string]: ElementDefinition } = {};

    public eventHandler: EventHandler;
    public renderer: Renderer;

    public playerAnimationHandler: AnimationHandler;


    public spriteContainer: { [id: string]: HTMLElement };
    public animations: { [id: string]: InternalAnimationContainer } = {};




    constructor(config: any)
    {
        this.config = $.extend(this.config, config);

        var self = this;
        $(document).keydown(function (event)
        {
            self.onkeydown(event);
        });

    }


    private onkeydown(event: JQueryKeyEventObject)
    {
        this.log(event);
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



    }

    public init()
    {
        this.loadConfig();
        this.initAnimations();

        var self = this;
        window.setTimeout(function ()
        {
            self.loadMap();

        }, 100);
    }

    private initAnimationContainer()
    {
        this.playerAnimationHandler = this.createAnimationHandler(1, this.renderer.getPlayerLayer());

    }

    private createAnimationHandler(level: number, layer: RendererLayer): AnimationHandler
    {
        var handler: AnimationHandler = new AnimationHandler(this, level);
        handler.setLayer(layer);

        return handler;
    }

    public setRenderer(renderer: Renderer)
    {
        this.renderer = renderer;
    }

    public setEventHandler(eventHandler: EventHandler)
    {
        this.eventHandler = eventHandler;
    }


    private initAnimations()
    {
        this.spriteContainer = {};

        // Load Animations of Elements ...
        var self = this;
        $.each(self.elements, function (ID: string, el: ElementDefinition)
        {
            if ((el.Dynamic !== undefined) && (el.Dynamic == true) && (el.AnimationDefinition !== undefined) && (el.AnimationDefinition != ""))
            {
                self.loadAnimation(el.AnimationDefinition);
            }

        });


    }


    public loadAnimation(path)
    {
        var data: AnimationContainer = <AnimationContainer>this.getFile(path);

        var container: InternalAnimationContainer =
            {
                ID: data.ID,
                ImageURI: data.ImageURI,
                Animations: {}
            };

        for (var i = 0; i < data.Animations.length; i++)
        {
            var anim = data.Animations[i];
            container.Animations[anim.ID] = anim;
        }

        this.animations[data.ID] = container;
        this.preloadImage(data.ID, data.ImageURI);


        //console.log(this.animations);
    }

    private preloadImage(name: string, path: string)
    {
        var self = this;
        this.loadImage(path, function (result)
        {
            self.log("Preload of Image '" + name + "' done: ", result);

            self.spriteContainer[name] = result;
        });
    }

    private loadImage(path: string, callback: (HTMLElement) => void)
    {
        var imageObj = new Image();

        imageObj.onload = function ()
        {
            callback(imageObj);
        };

        imageObj.src = path;

    }


    public loadConfig()
    {
        this.eventHandler.callEvent("preConfigLoad", this, null);

        this.log("Load Config from path: ", this.config.elementsPath);

        var result = this.getFile(this.config.elementsPath);

        var self = this;

        $.each(result, function (_, el)
        {
            self.elements[el.ID] = el;
        });

        this.log("Element Definitions loaded: ", this.elements);

        if (this.renderer !== undefined)
        {
            console.log(this.renderer);

            this.renderer.setConfig(this.elements);
        }

        this.eventHandler.callEvent("postConfigLoad", this, null);
    }

    public loadMap()
    {
        this.eventHandler.callEvent("preMapLoad", this, null);

        this.log("Load Map from path:", this.config.mapPath);

        var result = <Tile[][]>this.getFile(this.config.mapPath);


        if (this.renderer !== undefined)
        {
            this.renderer.initMap(result[0].length, result.length);
        }

        // Has to be done here
        this.initAnimationContainer();

        for (var y = 0; y < result.length; y++)
        {
            var collom = result[y];

            for (var x = 0; x < collom.length; x++)
            {
                result[y][x] = this.updateTile(result[y][x], x + 1, y + 1);
            }

        }
        this.map = result;

        if (this.renderer !== undefined)
        {
            this.renderer.setMap(this.map);
        }

        //_staticHeight = _map.length * _config.tileSize;
        //_staticWidth = _map[0].length * _config.tileSize;

        //_initLayer();

        this.log("Map Loaded: ", this.map);

        this.eventHandler.callEvent("postMapLoad", this, null);
    }

    private updateTile(tile: Tile, x: number, y: number)
    {
        tile.XCoord = x;
        tile.YCoord = y;

        this.eventHandler.callEvent("preTileUpdate", this, tile);

        if ((tile.BottomElementID !== undefined) && (tile.BottomElementID != null) && (tile.BottomElementID != ""))
        {
            if (this.elements[tile.BottomElementID] !== undefined)
            {
                tile.BottomElement = this.elements[tile.BottomElementID];
            }
            else
            {
                this.warn("Warning: No Element definintion '" + tile.BottomElementID + "' for Tile: ", tile);
            }
        }

        if ((tile.MiddleElementID !== undefined) && (tile.MiddleElementID != null) && (tile.MiddleElementID != ""))
        {
            if (this.elements[tile.MiddleElementID] !== undefined)
            {
                tile.MiddleElement = this.elements[tile.MiddleElementID];
            }
            else
            {
                this.warn("Warning: No Element definintion '" + tile.MiddleElementID + "' for Tile: ", tile);
            }
        }

        if ((tile.TopElementID !== undefined) && (tile.TopElementID != null) && (tile.TopElementID != ""))
        {
            if (this.elements[tile.TopElementID] !== undefined)
            {
                tile.TopElement = this.elements[tile.TopElementID];
            }
            else
            {
                this.warn("Warning: No Element definintion '" + tile.TopElementID + "' for Tile: ", tile);
            }
        }

        this.eventHandler.callEvent("postTileUpdate", this, tile);


        return tile;
    }



    // ---------------------------------------

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