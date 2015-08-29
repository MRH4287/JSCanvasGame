/// <reference path="jquery.d.ts" />
/// <reference path="eventHandler.ts" />
/// <reference path="interfaces.ts" />
/// <reference path="astar.d.ts" />


/// <reference path="animationHandler.ts" />
/// <reference path="playerManager.ts" />
/// <reference path="Renderer.ts" />
/// <reference path="windowManager.ts" />
/// <reference path="scriptHandler.ts" />
/// <reference path="NPCHandler.ts" />
/// <reference path="MultiplayerHandler.ts" />
/// <reference path="Profiler.ts" />
/// <reference path="pathHandler.ts" />
/// <reference path="TileHandler.ts" />

/**
 * Main Class
 */
class GameHandler
{
    /**
     * The Config Object
     */
    public config =
    {
        debug: true,
        width: 800,
        height: 300,
        tileSize: 25,
        elementsPath: "data/elements.json",
        npcDataPath: "data/npc/npcData.json",
        mapPath: "data/map2.json",
        showBlocking: true,
        verbose: false,
        initStaticAnimations: true,
        playStaticAnimations: true,
        hideOwnUsername: true,
        playerModel: "pichu",
        basePath: ""
    };

    /**
     * The current Map
     */
    public map: Tile[][];
    /**
     * List of all Element Definitions
     */
    public elements: { [id: string]: ElementDefinition } = {};

    /**
     * EventHandler Instance
     */
    public eventHandler: EventHandler;
    /**
     * Renderer Instance
     */
    public renderer: Renderer;


    /**
     * Animation Handler used for the lowest Animation Level
     */
    public bottomAnimationHandler: AnimationHandler;
    /**
     * Animation Handler used for the middle Animation Level
     */
    public middleAnimationHandler: AnimationHandler;
    /**
     * Animation Handler used for the top Animation Level
     */
    public topAnimationHandler: AnimationHandler;

    /**
     * Aniamtion Handler used for animating the Player
     */
    public playerAnimationHandler: AnimationHandler;
    /**
     * Handler to manage the Player Actions
     */
    public playerManager: PlayerManager;
    /**
     * Manager used for moving the current visible Window
     */
    public windowManager: WindowManager;
    /**
     * Manager used for NPCs
     */
    public npcManager: NPCHandler;
    /**
     * Handler used for Pathfinding
     */
    public pathHandler: PathHandler;

    /**
     * Handler used for managing Tile-Events
     */
    public tileHandler: TileHandler;

    /**
     * List of predfined NPCs
     */
    public npcDefinitions: { [id: string]: NPCInformation } = {};

    /**
     * List of all loaded Sprites
     */
    public spriteContainer: { [id: string]: HTMLImageElement };
    /**
     * List of all loaded Animations
     */
    public animations: { [id: string]: InternalAnimationContainer } = {};

    /**
     * Mapping between an ID and a Tile
     */
    private tileIDIndex: { [index: string]: Tile } = {};
    /**
     * Mapping between a Flag and a Tile
     */
    private tileFlagIndex: { [index: string]: Tile[] } = {};
    /**
     * Mapping between a Flag and Elements
     */
    private elementsFlagIndex: { [index: string]: ElementDefinition[] } = {};

    /**
     * Constructor
     * @param config Config Overload
     */
    constructor(config: any)
    {
        this.config = $.extend(this.config, config);

    }

    /**
     * Intializes System
     */
    public init(callback: () => void)
    {
        this.eventHandler.callEvent("preInit", this, null);

        this.loadConfig(() =>
        {
            this.initAnimations(() =>
            {
                this.windowManager = new WindowManager(this);

                this.eventHandler.callEvent("TaskCreated", self, "Player - INIT");
                window.setTimeout(() =>
                {
                    // Init Animation Container is called in loadMap
                    this.loadMap(() =>
                    {
                        this.eventHandler.callEvent("postInit", this, null);

                        this.eventHandler.callEvent("TaskDisposed", self, "Player - INIT");

                        callback();
                    });
                }, 100);
            });
        });



    }

    /**
     * Initializes the Animation Container and Manager
     */
    private initAnimationContainer()
    {
        this.bottomAnimationHandler = this.createAnimationHandler(0, this.renderer.getBottomAnimationLayer());
        this.middleAnimationHandler = this.createAnimationHandler(1, this.renderer.getMiddleAnimationLayer());
        this.topAnimationHandler = this.createAnimationHandler(2, this.renderer.getTopAnimationLayer());
        this.playerAnimationHandler = this.createAnimationHandler(3, this.renderer.getPlayerLayer()); // , "playerLayer"

        this.playerManager = new PlayerManager(this, this.playerAnimationHandler, this.config.playerModel);
        this.npcManager = new NPCHandler(this, this.middleAnimationHandler);
        this.pathHandler = new PathHandler(this);
        this.tileHandler = new TileHandler(this);
    }

    /**
     * Create a new Animation Handler for a specific Level
     * @param level The Level of the Handler
     * @param layer The RendererLayer instance for this Layer
     * @param staticName Used for combining a list of Animations into one
     */
    private createAnimationHandler(level: number, layer: RendererLayer, staticName?: string): AnimationHandler
    {
        var handler: AnimationHandler = new AnimationHandler(this, level, staticName);
        handler.setLayer(layer);

        return handler;
    }

    /**
     * Set the Renderer Instance
     * @param renderer The Renderer Instance
     */
    public setRenderer(renderer: Renderer)
    {
        this.renderer = renderer;
    }

    /**
     * Set the EventHandler
     * @param eventHandler The EventHandler Instance
     */
    public setEventHandler(eventHandler: EventHandler)
    {
        this.eventHandler = eventHandler;
    }



    /**
     * Intialize the Animations for all Dynamic Elements in the elements List
     * @param callback called when finished
     */
    private initAnimations(callback: () => void)
    {
        this.spriteContainer = {};

        // Load Animations of Elements ...
        var self = this;
        var queue: ElementDefinition[] = [];

        $.each(self.elements, function (ID: string, el: ElementDefinition)
        {
            queue.push(el);
        });

        var executeNext = function ()
        {
            var current = queue.pop();
            if (current === undefined || current === null)
            {
                callback();
                return;
            }
            else
            {
                if ((current.Dynamic !== undefined) && (current.Dynamic === true) && (current.AnimationDefinition !== undefined) && (current.AnimationDefinition !== ""))
                {
                    self.loadAnimation(current.AnimationDefinition, () =>
                    {
                        executeNext();
                    });

                    return;
                }
                else
                {
                    executeNext();
                    return;
                }
            }

        };

        executeNext();
    }


    /**
     * Load an Animation from a specfic Path
     * @param path The Path to the Animation
     * @param callback Callback when finished
     */
    public loadAnimation(path: string, callback: () => void)
    {
        //var data: AnimationContainer = <AnimationContainer>this.getFile(path);
        this.getFile(path, (data: AnimationContainer) =>
        {

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

            callback();

        });
        //console.log(this.animations);
    }


    /**
     * Preload a specific Image
     * @param name The Name of the Image
     * @param path The Path to the Image
     */
    private preloadImage(name: string, path: string)
    {
        var self = this;
        this.loadImage(path, function (result)
        {
            self.log("Preload of Image '" + name + "' done: ", result);

            self.spriteContainer[name] = result;
        });
    }

    /**
     * Load an Image from a Path
     * @param path The Path to the Image
     * @param callback Callback with Image Result
     */
    private loadImage(path: string, callback: (HTMLElement) => void)
    {
        var imageObj = new Image();

        imageObj.onload = function ()
        {
            callback(imageObj);
        };

        imageObj.src = this.config.basePath + path;

    }


    /**
     * Load the Config File from the Server and Initialize
     * @param callback Called when finished
     */
    public loadConfig(callback: () => void)
    {
        this.eventHandler.callEvent("preConfigLoad", this, null);

        this.log("Load Config from path: ", this.config.elementsPath);

        this.getFile(this.config.elementsPath, (result) =>
        {

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

            this.log("Load NPC-Data");

            this.getFile(this.config.npcDataPath, (result) =>
            {

                $.each(result, function (_, el: NPCInformation)
                {
                    self.npcDefinitions[el.ID] = el;
                });

                this.log("NPC-Data loaded", this.npcDefinitions);


                if (this.renderer !== undefined)
                {
                    console.log(this.renderer);

                    this.renderer.setConfig(this.elements);
                }

                this.eventHandler.callEvent("postConfigLoad", this, null);

                callback();
            });
        });
    }

    /**
     * Change the current Level
     * @param path Path to new Level File
     * @param callback Is triggered when the Call is ready
     */
    public changeLevel(path: string, callback?: () => void)
    {
        this.eventHandler.callEvent("preLevelChange", this, path);

        this.config.mapPath = path;
        this.map = [];
        this.tileIDIndex = {};
        this.tileFlagIndex = {};
        this.elementsFlagIndex = {};
        this.npcManager.clear();

        this.loadMap(() =>
        {
            this.playerManager.movePlayerToSpawn();
            this.playerManager.resetPlayerModel();

            this.eventHandler.callEvent("postLevelChange", this, null);

            if (callback !== undefined)
            {
                callback();
            }

        }, true);
    }


    /**
     * Load the Map from the Path specific in the Config Object
     * @param callback Called when finished
     * @param reset Cleanup old Instance
     */
    public loadMap(callback: () => void, reset: boolean = false)
    {
        this.eventHandler.callEvent("preMapLoad", this, null);

        this.log("Load Map from path:", this.config.mapPath);


        this.getFile(this.config.mapPath, (result: Tile[][]) =>
        {
            // Check File Size:
            var maxTileCount = 3025;
            var count = 0;
            $.each(result, (i, column) =>
            {
                count += column.length;
            });

            console.log("TileCount: " + count + " - Max: " + maxTileCount);
            if (count > maxTileCount)
            {
                console.error("The Size of the Map is too big!");

                callback();
                return;
            }



            if (this.renderer !== undefined)
            {
                this.renderer.initMap(result[0].length, result.length);
            }

            if (reset)
            {
                var handler = [this.bottomAnimationHandler, this.middleAnimationHandler, this.topAnimationHandler, this.playerAnimationHandler];
                $.each(handler, function (_, el)
                {
                    if (el !== undefined)
                    {
                        el.clear();
                    }
                });
            }
            else
            {
                // Has to be done here
                this.initAnimationContainer();
            }

            var queue: { element: Tile; x: number; y: number }[] = [];

            for (var y = 0; y < result.length; y++)
            {
                var collom = result[y];

                for (var x = 0; x < collom.length; x++)
                {
                    queue.push({
                        element: result[y][x],
                        x: x,
                        y: y
                    });
                }

            }

            var done = (result: Tile[][]) =>
            {
                this.map = result;

                if (this.renderer !== undefined)
                {
                    this.renderer.setMap(this.map, reset);
                }

                //_staticHeight = _map.length * _config.tileSize;
                //_staticWidth = _map[0].length * _config.tileSize;

                //_initLayer();

                this.log("Map Loaded: ", this.map);

                this.eventHandler.callEvent("postMapLoad", this, this.map);

                callback();
            };

            var executeNext = () =>
            {
                var current: { element: Tile; x: number; y: number } = queue.pop();
                if (current === undefined || current === null)
                {
                    done(result);
                    return;
                }
                else
                {
                    this.updateTile(current.element, current.x + 1, current.y + 1, () =>
                    {
                        executeNext();
                    });
                }
            };

            window.setTimeout(() =>
            {
                executeNext();
            }, 150);
        });
    }

    /**
     * Update a Tile loaded from the Map-File and add Content
     * @param tile The Tile Instance
     * @param x The current X-Position
     * @param y The current Y-Position
     * @param callback Called when finished
     */
    private updateTile(tile: Tile, x: number, y: number, callback: (result: Tile) => void): void
    {
        tile.XCoord = x;
        tile.YCoord = y;

        this.eventHandler.callEvent("preTileUpdate", this, tile);

        if ((tile.BottomElementID !== undefined) && (tile.BottomElementID !== null) && (tile.BottomElementID !== ""))
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

        if ((tile.MiddleElementID !== undefined) && (tile.MiddleElementID !== null) && (tile.MiddleElementID !== ""))
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

        if ((tile.TopElementID !== undefined) && (tile.TopElementID !== null) && (tile.TopElementID !== ""))
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

        if (tile.Events !== undefined && tile.Events !== null)
        {
            tile.EventMapping = {};

            $.each(tile.Events, (_, el) =>
            {
                tile.EventMapping[el.key] = el.value;
            });
        }

        if (tile.Data !== undefined && tile.Data !== null)
        {
            tile.DataMapping = {};

            $.each(tile.Data, (_, el) =>
            {
                tile.DataMapping[el.key] = el.value;
            });
        }

        var postNPC = () =>
        {
            this.eventHandler.callEvent("postTileUpdate", this, tile);
            callback(tile);
        };

        // Add NPCs:
        if (tile.MiddleElementID === "NPCSpawn")
        {
            var npcID : string = undefined;
            var npcName : string = undefined;

            if (tile.DataMapping !== undefined && tile.DataMapping !== null)
            {
                npcID = tile.DataMapping["NPC"];
                npcName = tile.DataMapping["NPC-Name"];
            }
            else
            {
                console.warn("No Data Attribute found for NPC-Spawner. Using Flags instead. This method is deprecated");

                var npcRegex: RegExp = new RegExp("NPC=(.+)");
                var nameRegex: RegExp = new RegExp("NPCName=(.+)");

                $.each(tile.Flags, function (_, flag)
                {
                    if (npcRegex.test(flag))
                    {
                        var idMatch = npcRegex.exec(flag);
                        npcID = idMatch[1];
                    }
                    if (nameRegex.test(flag))
                    {
                        var nameMatch = npcRegex.exec(flag);
                        npcName = nameMatch[1];
                    }

                });
            }

            if (npcID === undefined)
            {
                console.warn("Element has Element 'NPCSpawn' but don't define the Data 'NPC=...'!", tile);

                postNPC();
                return;
            }
            else
            {
                var npcData = this.npcDefinitions[npcID];
                npcName = npcName || npcID + Math.random();

                console.info("Add NPC with ID: ", npcName);

                var addNPC = () =>
                {
                    this.npcManager.addNPC(npcName, { X: tile.XCoord, Y: tile.YCoord }, npcData.AnimationContainer, npcData.DefaultAnimation, npcData.Speed);

                    postNPC();
                };

                if (this.animations[npcData.AnimationContainer] === undefined)
                {
                    this.log("Animation for NPC not available. Load Animation: ", npcData.AnimationContainer);
                    this.loadAnimation("data/animations/" + npcData.AnimationContainer + ".json", () =>
                    {
                        addNPC();
                    });
                    return;
                }
                else
                {
                    addNPC();
                    return;
                }
            }
            //TODO: Add NPC-Script
        }
        else
        {
            postNPC();
        }


    }

    /**
     * Gets a Tile at a specific Position
     * @param x X-Position
     * @param y Y-Position
     */
    public getTileAtPos(x: number, y: number): Tile
    {
        if (this.map === undefined || this.map[y - 1] === undefined || this.map[y - 1][x - 1] === undefined)
        {
            console.log("Found no Tile at Position: ", x, y);
            return null;
        }

        return this.map[y - 1][x - 1];
    }

    /**
     * Check if a secific Coordinate is passable by the Player
     * @param x X-Position
     * @param y Y-Position
     */
    public isCoordPassable(x: number, y: number): boolean
    {
        var tile = this.getTileAtPos(x, y);

        if (tile === undefined || tile === null)
        {
            this.warn("Tile not found: ", [x, y]);
            return false;
        }

        var bottomPassable = ((tile.BottomElement !== undefined) && (tile.BottomElement !== null)) ? tile.BottomElement.Passable : true;
        var middlePassable = ((tile.MiddleElement !== undefined) && (tile.MiddleElement !== null)) ? tile.MiddleElement.Passable : true;
        var topPassable = ((tile.TopElement !== undefined) && (tile.TopElement !== null)) ? tile.TopElement.Passable : true;

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

    /**
     * Get a Map of all passable Tiles.
     * Used for Pathfinding
     */
    public getMapPassableData(): number[][]
    {
        var maxX = this.map.length;
        var maxY = this.map[0].length;

        var result: number[][] = [];

        for (var x = 0; x < maxX; x++)
        {
            var data: number[] = [];

            for (var y = 0; y < maxY; y++)
            {
                data[y] = this.isCoordPassable(x + 1, y + 1) ? 1 : 0;
            }

            result[x] = data;
        }

        return result;
    }

    /**
     * Get an ElementDefintion by its Name
     * @param ID Name of the Element
     */
    public getElementByID(ID: string): ElementDefinition
    {
        return this.elements[ID];
    }

    /**
     * Get List of Elements by their Flag
     * @param Flag Name of the Flag
     */
    public getElementsByFlagName(Flag: string): ElementDefinition[]
    {
        var list = this.elementsFlagIndex[Flag];

        return (list !== undefined) ? list : [];
    }

    /** 
     * Get Tile by ID
     * @param ID ID of the Tile
     */
    public getTileByID(ID: string): Tile
    {
        return this.tileIDIndex[ID];
    }

    /**
     * Get List of Tiles by their Flag
     * @param Flag Name of the Flag
     */
    public getTilesByFlagName(Flag: string): Tile[]
    {
        var list = this.tileFlagIndex[Flag];

        return (list !== undefined) ? list : [];
    }


    // ---------------------------------------

    /**
     * Ecevute a specific Callback wih full Debug-Log
     * @param data The Action to execute
     */
    public execVerbose(data: () => void)
    {
        this.config.verbose = true;
        data();
        this.config.verbose = false;
    }

    /**
     * Start Full Debug-Log for a specific Time
     * @param time Time in Miliseconds
     */
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

    /**
     * Load a File from the Sever
     * @param url Path to the File
     * @param callback Callback with Result
     */
    public getFile(url: string, callback: (any) => void, dataType?: string): any
    {
        var async = (!(typeof (callback) === "undefined"));
        dataType = (typeof (dataType) === "undefined") ? "json" : dataType;

        var tempResult = null;

        $.ajax({
            dataType: dataType,
            url: this.config.basePath + url,
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
