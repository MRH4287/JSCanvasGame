/// <reference path="gameHandler.ts" />

class Renderer
{
    /*
    // Default Config
    var _config = {
        debug: true,
        width: 800,
        height: 300,
        tileSize: 25,
        elementsPath: "data/elements.json",
        mapPath: "data/map2.json",
        showBlocking: true
    };
    */




    // Variables
    private canvas;
    private ctx;

    private bufferCanvas;
    private bufferCtx;

    private fps = 0;
    private now = Date.now();
    private lastUpdate = Date.now();

    // The higher this value, the less the FPS will be affected by quick changes
    // Setting this to 1 will show you the FPS of the last sampled frame only
    private fpsFilter: number = 5;

    private minTimeBetweenFrames = 20;
    private lastCheck: number = null;


    private layer: {
        BottomStaticLayer: RendererLayer;
        BottomAnimationLayer: RendererLayer;
        MiddleStaticLayer: RendererLayer;
        MiddleAnimationLayer: RendererLayer;
        PlayerLayer: RendererLayer;
        TopStaticLayer: RendererLayer;
        TopAnimationLayer: RendererLayer;
    } =
    {
        BottomStaticLayer:
        {
            canvas: null,
            ctx: null
        },
        BottomAnimationLayer:
        {
            canvas: null,
            ctx: null
        },
        MiddleStaticLayer:
        {
            canvas: null,
            ctx: null
        },
        MiddleAnimationLayer:
        {
            canvas: null,
            ctx: null
        },
        PlayerLayer:
        {
            canvas: null,
            ctx: null
        },
        TopStaticLayer:
        {
            canvas: null,
            ctx: null
        },
        TopAnimationLayer:
        {
            canvas: null,
            ctx: null
        }
    };

    private width = 0;
    private height = 0;

    private staticWidth = 0;
    private staticHeight = 0;
    private staticRendered = false;

    // Todo: ---
    // Auslagern zum Game Manager ---
    private elements = {};
    private map = [];

    private offset: Coordinate = {
        X: 0,
        Y: 0
    };

    private eventHandler: EventHandler = null;
    private gameHandler: GameHandler = null;


    // Constructor ---------

    constructor(canvas, gameHandler)
    {
        this.gameHandler = gameHandler;
        if (gameHandler === undefined)
        {
            console.warn("Second Argument of Renderer is undefined.");
            return;
        }

        //_gameHandler.setRenderer(this);

        this.eventHandler = gameHandler.eventHandler;
        if (this.eventHandler === undefined)
        {
            console.warn("Third Argument of Renderer is undefined.");
            return;
        }



        this.eventHandler.callEvent("renderPreInit", this, null);

        this.canvas = canvas;
        //_config = $.extend(_config, __config);

        this.width = this.gameHandler.config.width;
        this.height = this.gameHandler.config.height;
        this.ctx = this.canvas.getContext("2d");

    $(this.canvas)
            .attr("width", this.width)
            .attr("height", this.height);


        var self = this;


        this.eventHandler.addEventListener("forceRerender", function ()
        {
            // Change that back if it won't work as wanted ...
            // _render();
            self.beginDrawing();
        });

        this.eventHandler.addEventListener("postInit", function ()
        {
            self.beginDrawing();
        });

        this.eventHandler.callEvent("renderPostInit", this, null);

        //setInterval(_beginDrawing, 1);
    }

    private beginDrawing()
    {
        var div = (Date.now() - this.lastCheck);

        if ((this.lastCheck != null) && (div < this.minTimeBetweenFrames))
        {
            return;
        }

        if (this.gameHandler.config.verbose)
        {
            this.gameHandler.log("Begin Rendering - Last Frame: ", div);
        }

        this.lastCheck = Date.now();


        this.render();

        // TODO: Check this ....
        var thisFrameFPS = 1000 / ((this.now = Date.now()) - this.lastUpdate);
        if (this.now !== this.lastUpdate)
        {
            this.fps += (thisFrameFPS - this.fps) / this.fpsFilter;
            this.lastUpdate = this.now;
        }

    }


    public getFPS()
    {
        return this.fps;
    }

    private initLayer()
    {
        var self = this;

        // Init Layer:
        $.each(this.layer, function (k, el)
        {
            if (typeof (self.layer[k].canvas) === "undefined" || self.layer[k].canvas == null)
            {
                self.layer[k].canvas = document.createElement("canvas");
            }
            $(self.layer[k].canvas)
                .attr("width", self.staticWidth)
                .attr("height", self.staticHeight);

            self.layer[k].ctx = self.layer[k].canvas.getContext("2d");
        });


        if (typeof (this.bufferCanvas) === "undefined" || this.bufferCanvas == null)
        {
            this.bufferCanvas = document.createElement("canvas");
        }
        $(this.bufferCanvas)
            .attr("width", this.staticWidth)
            .attr("height", this.staticHeight);

        this.bufferCtx = this.bufferCanvas.getContext("2d");


    }


    // ---- Config Handler ----

    public setConfig(elements)
    {
        this.elements = elements;
    }

    public initMap(sizeX, sizeY)
    {
        this.staticHeight = sizeY * this.gameHandler.config.tileSize;
        this.staticWidth = sizeX * this.gameHandler.config.tileSize;


        this.initLayer();
    }

    public setMap(map, reset)
    {
        this.eventHandler.callEvent("renderPreMapLoad", this, null);

        if (reset === true)
        {
            this.staticRendered = false;
        }


        if ((this.staticHeight === 0) || (this.staticWidth === 0))
        {
            this.gameHandler.error("The function 'initMap' has to be called before the SetMap function!");
            return;
        }


        this.map = map;

        if (reset === true)
        {
            this.eventHandler.callEvent("forceRerender", this, null);
        }


        this.gameHandler.log("Renderer Map Loaded: ", this.map);

        this.eventHandler.callEvent("renderPostMapLoad", this, null);
    }

    private updateTile(tile)
    {
        if ((tile.BottomElementID !== undefined) && (tile.BottomElementID !== null) && (tile.BottomElementID !== ""))
        {
            if (this.elements[tile.BottomElementID] !== undefined)
            {
                tile.BottomElement = this.elements[tile.BottomElementID];
            }
            else
            {
                this.gameHandler.warn("Warning: No Element definintion '" + tile.BottomElementID + "' for Tile: ", tile);
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
                this.gameHandler.warn("Warning: No Element definintion '" + tile.MiddleElementID + "' for Tile: ", tile);
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
                this.gameHandler.warn("Warning: No Element definintion '" + tile.TopElementID + "' for Tile: ", tile);
            }
        }


        return tile;
    }

    private renderMap(callback)
    {
        var self = this;

        this.eventHandler.callEvent("renderPreMapRender", this, null);

        if (this.gameHandler.config.verbose)
        {
            this.gameHandler.log("Map rendering ...");
        }

        this.clear(this.layer.BottomStaticLayer.ctx);
        this.clear(this.layer.MiddleStaticLayer.ctx);
        this.clear(this.layer.TopStaticLayer.ctx);


        function okCallback()
        {
            self.eventHandler.callEvent("TaskCreated", this, "Renderer - RenderMapCallback - Step2");
            window.setTimeout(function ()
            {

                callback();

                self.eventHandler.callEvent("TaskDisposed", this, "Renderer - RenderMapCallback - Step2");
            }, 1);

            self.staticRendered = true;

            self.eventHandler.callEvent("TaskDisposed", this, "Renderer - RenderMapCallback - Step1");
        }

        for (var collom = 0; collom < this.map.length; collom++)
        {
            //_log("Row: ", collom);

            var yOffset = collom * this.gameHandler.config.tileSize; // - _offset.y;

            for (var element = 0; element < this.map[collom].length; element++)
            {
                //_log("Element: ", element);

                var xOffset = element * this.gameHandler.config.tileSize; // - _offset.x;

                //_log(xOffset);


                this.map[collom][element].X = xOffset;
                this.map[collom][element].Y = yOffset;

                //if ((((xOffset + _config.tileSize) < _offset.x) || ((yOffset + _config.tileSize) < _offset.y)) || ((xOffset + _offset.x > _width) || (yOffset + _offset.y > _height)))
                //{
                //_log("Tile out of sight: ", _map[collom][element]);
                //continue;
                //}

                if (
                    ((xOffset + this.gameHandler.config.tileSize) < this.offset.X) ||
                    (yOffset + this.gameHandler.config.tileSize) < this.offset.Y //||
                //(xOffset > ( _width + _offset.x))

                    )
                {
                    continue;
                }

                var last = ((collom === this.map.length - 1) && (element === this.map[collom].length - 1));

                if (last)
                {
                    this.eventHandler.callEvent("TaskCreated", this, "Renderer - RenderMapCallback - Step1");
                    window.setTimeout(okCallback, 100);

                }

                this.addTile(this.map[collom][element], xOffset, yOffset, (last) ? okCallback : undefined);
            }


        }

        this.eventHandler.callEvent("renderPostMapRender", this, null);
    }

    private renderDynamic()
    {
        this.eventHandler.callEvent("render", this, this.layer);
    }


    private render()
    {
        var self = this;

        this.eventHandler.callEvent("renderPreRender", this, null);
        var combine = function ()
        {
            // Clear the Buffer:
            self.clear(self.bufferCtx);
            //_clear(_ctx);

            //console.log("Combine");

            // Combine Layer:
            self.bufferCtx.drawImage(self.layer['BottomStaticLayer'].canvas, 0, 0);
            self.bufferCtx.drawImage(self.layer['BottomAnimationLayer'].canvas, 0, 0);
            self.bufferCtx.drawImage(self.layer['MiddleStaticLayer'].canvas, 0, 0);
            self.bufferCtx.drawImage(self.layer['MiddleAnimationLayer'].canvas, 0, 0);
            self.bufferCtx.drawImage(self.layer['PlayerLayer'].canvas, 0, 0);
            self.bufferCtx.drawImage(self.layer['TopStaticLayer'].canvas, 0, 0);
            self.bufferCtx.drawImage(self.layer['TopAnimationLayer'].canvas, 0, 0);

            //_eventHandler.callEvent("TaskCreated", this, "Renderer - DrawImage");
            //window.setTimeout(function ()
            //{


            self.ctx.drawImage(self.bufferCanvas, self.offset.X * -1, self.offset.Y * -1);

            //_eventHandler.callEvent("TaskDisposed", this, "Renderer - DrawImage");

            //}, 2);
        };

        this.renderDynamic();

        if (!this.staticRendered)
        {
            // Trigger MapRender
            this.renderMap(combine);
        }
        else
        {
            combine();
        }

        this.eventHandler.callEvent("renderPostRender", this, null);
    }


    // -------------

    public setOffset(offset: Coordinate)
    {
        this.offset.X = offset.X;
        this.offset.Y = offset.Y;

        //_render();
    }

    public getBottomAnimationLayer()
    {
        return this.layer['BottomAnimationLayer'];
    }

    public getMiddleAnimationLayer()
    {
        return this.layer['MiddleAnimationLayer'];
    }

    public getTopAnimationLayer()
    {
        return this.layer['TopAnimationLayer'];
    }

    public getPlayerLayer()
    {
        return this.layer['PlayerLayer'];
    }


    public getTileSize()
    {
        return this.gameHandler.config.tileSize;
    }

    public getMapSize(): Coordinate
    {
        return {
            X: this.staticWidth,
            Y: this.staticHeight
        };


    }


    // --- Draw Functions ----
    private clear(ctx)
    {
        /*ctx.rect(0, 0, _width, _height);
        ctx.fillStyle = 'green';
        ctx.fill();*/

        if (ctx !== undefined)
        {
            ctx.clearRect(0, 0, this.staticWidth, this.staticHeight);
        }
    }

    public clearRenderContext(ctx)
    {
        this.clear(ctx);
    }


    private addTile(tile: Tile, x: number, y: number, readyCallback: () => void)
    {
        //_log("Render Tile: ", tile);
        var self = this;


        var bottom = tile.BottomElement;
        var middle = tile.MiddleElement;
        var top = tile.TopElement;

        var callback = function (where)
        {

            if ((bottom === undefined) && (middle === undefined) && (top === undefined))
            {
                return readyCallback;
            }
            else if ((bottom !== undefined) && (middle === undefined) && (top === undefined) && (where === "bottom"))
            {
                return readyCallback;
            }
            else if ((bottom !== undefined) && (middle !== undefined) && (top === undefined) && (where === "middle"))
            {
                return readyCallback;
            }
            else if ((bottom !== undefined) && (top !== undefined) && (where === "top"))
            {
                return readyCallback;
            }
            else
            {
                return undefined;
            }

        };


        if ((bottom !== undefined) && ((bottom.Dynamic === undefined) || (!bottom.Dynamic)))
        {
            this.addImage(this.layer.BottomStaticLayer.ctx, bottom, x, y, undefined, undefined, callback("bottom"));
        }
        if ((middle !== undefined) && ((middle.Dynamic === undefined) || (!middle.Dynamic)))
        {
            this.addImage(this.layer.MiddleStaticLayer.ctx, middle, x, y, undefined, undefined, callback("middle"));
        }
        if ((top !== undefined) && ((top.Dynamic === undefined) || (!top.Dynamic)))
        {
            this.addImage(this.layer.TopStaticLayer.ctx, top, x, y, undefined, undefined, callback("top"));
        }


    }

    private addImage(ctx, tile, x, y, width, height, imageOnLoad)
    {
        var src = tile.ImageURI;


        if (((tile.Dynamic !== undefined) && (tile.Dynamic)) ||
            ((tile.Flags !== undefined) && (tile.Flags.indexOf("editorElement") !== -1)))
        {
            if (imageOnLoad !== undefined)
            {
                imageOnLoad({
                    x: x,
                    y: y,
                    width: width,
                    height: height,
                    image: imageObj
                });
            }

            return;
        }


        var imageObj = new Image();

        if (typeof (width) === "undefined")
        {
            width = this.gameHandler.config.tileSize;
        }

        if (typeof (height) === "undefined")
        {
            height = this.gameHandler.config.tileSize;
        }

        imageObj.onload = function ()
        {
            ctx.drawImage(imageObj, x, y, width, height);

            if (imageOnLoad !== undefined)
            {
                imageOnLoad({
                    x: x,
                    y: y,
                    width: width,
                    height: height,
                    image: imageObj
                });
            }
        };

        imageObj.src = src;
    }


    // --- Helper Functions ----

    private getFile(url, callback, dataType)
    {

        return this.gameHandler.getFile(url, callback, dataType);

    }

}
