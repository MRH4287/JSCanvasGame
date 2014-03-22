/// <reference path="jquery.d.ts" />
/// <reference path="eventHandler.ts" />
/// <reference path="interfaces.ts" />


/// <reference path="animationHandler.ts" />
/// <reference path="playerManager.ts" />
/// <reference path="windowManager.ts" />
/// <reference path="scriptHandler.ts" />
/// <reference path="NPCHandler.ts" />
/// <reference path="MultiplayerHandler.ts" />
/// <reference path="Profiler.ts" />

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
        verbose: false,
        initStaticAnimations: true,
        playStaticAnimations: true,
        hideOwnUsername: true,
        playerModel: "pichu"
    };

    public map: Tile[][];
    public elements: { [id: string]: ElementDefinition } = {};

    public eventHandler: EventHandler;
    public renderer: Renderer;


    public bottomAnimationHandler: AnimationHandler;
    public middleAnimationHandler: AnimationHandler;
    public topAnimationHandler: AnimationHandler;

    public playerAnimationHandler: AnimationHandler;
    public playerManager: PlayerManager;
    public windowManager: WindowManager;
    public npcManager: NPCHandler;


    public spriteContainer: { [id: string]: HTMLElement };
    public animations: { [id: string]: InternalAnimationContainer } = {};


    private tileIDIndex: { [index: string]: Tile } = {};
    private tileFlagIndex: { [index: string]: Tile[] } = {};
    private elementsFlagIndex: { [index: string]: ElementDefinition[] } = {};

    constructor(config: any)
    {
        this.config = $.extend(this.config, config);

    }

    public init()
    {
        this.eventHandler.callEvent("preInit", this, null);

        this.loadConfig();
        this.initAnimations();
        this.windowManager = new WindowManager(this);


        var self = this;

        self.eventHandler.callEvent("TaskCreated", self, "Player - INIT");
        window.setTimeout(function ()
        {
            // Init Animation Container is called in loadMap
            self.loadMap();

            this.eventHandler.callEvent("postInit", this, null);

            self.eventHandler.callEvent("TaskDisposed", self, "Player - INIT");
        }, 100);


    }

    private initAnimationContainer()
    {
        this.bottomAnimationHandler = this.createAnimationHandler(0, this.renderer.getBottomAnimationLayer());
        this.middleAnimationHandler = this.createAnimationHandler(1, this.renderer.getMiddleAnimationLayer());
        this.topAnimationHandler = this.createAnimationHandler(2, this.renderer.getTopAnimationLayer());
        this.playerAnimationHandler = this.createAnimationHandler(3, this.renderer.getPlayerLayer()); // , "playerLayer"

        this.playerManager = new PlayerManager(this, this.playerAnimationHandler, this.config.playerModel);
        this.npcManager = new NPCHandler(this, this.middleAnimationHandler);
    }

    private createAnimationHandler(level: number, layer: RendererLayer, staticName?: string): AnimationHandler
    {
        var handler: AnimationHandler = new AnimationHandler(this, level, staticName);
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

            if (self.elements[el.ID].Flags !== undefined)
            {
                $.each(self.elements[el.ID].Flags, function (_, flag)
                {
                    if (self.elementsFlagIndex[flag] === undefined)
                    {
                        self.elementsFlagIndex[flag] = [];
                    }

                    self.elementsFlagIndex[flag].push(el);
                });
            }

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

        if (tile.ID !== undefined)
        {
            this.tileIDIndex[tile.ID] = tile;
        }

        var self = this;
        if (tile.Flags !== undefined)
        {
            $.each(tile.Flags, function (_, flag)
            {
                if (self.tileFlagIndex[flag] === undefined)
                {
                    self.tileFlagIndex[flag] = [];
                }

                self.tileFlagIndex[flag].push(tile);
            });
        }


        this.eventHandler.callEvent("postTileUpdate", this, tile);


        return tile;
    }

    public getTileAtPos(x: number, y: number): Tile
    {
        return this.map[y - 1][x - 1];
    }

    public isCoordPassable(x: number, y: number): boolean
    {
        var tile = this.getTileAtPos(x, y);

        if (tile == undefined)
        {
            this.warn("Tile not found: ", [x, y]);
            return false;
        }

        var bottomPassable = ((tile.BottomElement !== undefined) && (tile.BottomElement != null)) ? tile.BottomElement.Passable : true;
        var middlePassable = ((tile.MiddleElement !== undefined) && (tile.MiddleElement != null)) ? tile.MiddleElement.Passable : true;
        var topPassable = ((tile.TopElement !== undefined) && (tile.TopElement != null)) ? tile.TopElement.Passable : true;

        var data =
            {
                Tile: tile,
                X: x,
                Y: y,
                result: bottomPassable && middlePassable && topPassable
            };

        this.eventHandler.callEvent("CheckIsPassable", this, data);


        return data.result;

    }

    public getElementByID(ID: string): ElementDefinition
    {
        return this.elements[ID];
    }

    public getElementsByFlagName(Flag: string): ElementDefinition[]
    {
        var list = this.elementsFlagIndex[Flag];

        return (list !== undefined) ? list : [];
    }

    public getTileByID(ID: string): Tile
    {
        return this.tileIDIndex[ID];
    }

    public getTilesByFlagName(Flag: string): Tile[]
    {
        var list = this.tileFlagIndex[Flag];

        return (list !== undefined) ? list : [];
    }


    // ---------------------------------------

    public execVerbose(data: () => void)
    {
        this.config.verbose = true;
        data();
        this.config.verbose = false;
    }

    public activateVerbose(time: number = 500)
    {
        this.config.verbose = true;

        var self = this;
        window.setTimeout(function ()
        {
            self.config.verbose = false;
        }, time);

    }


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