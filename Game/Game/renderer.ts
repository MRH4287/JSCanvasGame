/// <reference path="jquery.d.ts" />

class Renderer
{

    // Default Config
    private _config: any = {
        debug: true,
        width: 800,
        height: 300,
        tileSize: 25,
        elementsPath: "map/elements.json",
        mapPath: "map/map2.json",
        showBlocking: true
    };

    // Variables
    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;

    private _bufferCanvas: HTMLCanvasElement;
    private _bufferCtx: CanvasRenderingContext2D;

    private _layer =
    {
        BottomStaticLayer:
        {
            canvas: null,
            ctx: null
        },
        MiddleStaticLayer:
        {
            canvas: null,
            ctx: null
        },
        PlayerLayer:
        {
            canvas: null,
            ctx: null
        },
        AnimationLayer:
        {
            canvas: null,
            ctx: null
        },
        TopStaticLayer:
        {
            canvas: null,
            ctx: null
        }
    };

    private _width: Number = 0;
    private _height: Number = 0;

    private _staticWidth: Number = 0;
    private _staticHeight: Number = 0;
    private _staticRendered: boolean = false;

    private _elements = {};
    private _map = [];

        private _offset: { x: number; y: number; } =
    {
        x: 0,
        y: 0
    }


    // Constructor ---------

    constructor(__canvas: HTMLCanvasElement, __config: Object)
    {
        this._canvas = __canvas;
        this._config = $.extend(this._config, __config);

        this._width = this._config.width;
        this._height = this._config.height;
        this._ctx = this._canvas.getContext("2d")

        $(this._canvas)
            .attr("width", this._width)
            .attr("height", this._height);



        this._bufferCanvas = document.createElement("canvas");
        $(this._bufferCanvas)
            .attr("width", this._width)
            .attr("height", this._height);

        this._bufferCtx = this._bufferCanvas.getContext("2d");

        this._loadConfig();
        this._loadMap();

    }


        private _initLayer = function ()
    {

        var self = this;
        // Init Layer:
        $.each(this._layer, function (k, el)
        {
            self._layer[k].canvas = document.createElement("canvas");
            $(self._layer[k].canvas)
                .attr("width", self._staticWidth)
                .attr("height", self._staticHeight);

            self._layer[k].ctx = self._layer[k].canvas.getContext("2d");
        });
    }


    // ---- Config Handler ----

        private _loadConfig = function ()
    {
        this._elements = {};

        this._log("Load Config from path: ", this._config.elementsPath);

        var result = this._getFile(this._config.elementsPath);

        var self = this;
        $.each(result, function (_, el)
        {
            self._elements[el.ID] = el;
        });

        this._log("Element Definitions loaded: ", this._elements);

    }

    private _loadMap = function ()
    {
        this._log("Load Map from path:", this._config.mapPath);

        var result = this._getFile(this._config.mapPath);

        for (var y = 0; y < result.length; y++)
        {
            var collom = result[y];

            for (var x = 0; x < collom.length; x++)
            {
                result[y][x] = this._updateTile(result[y][x]);
            }

        }
        this._map = result;

        this._staticHeight = this._map.length * this._config.tileSize;
        this._staticWidth = this._map[0].length * this._config.tileSize;

        this._initLayer();

        this._log("Map Loaded: ", this._map);


    }

    private _updateTile = function (tile)
    {
        if ((tile.BottomElementID !== undefined) && (tile.BottomElementID != null) && (tile.BottomElementID != ""))
        {
            if (this._elements[tile.BottomElementID] !== undefined)
            {
                tile.BottomElement = this._elements[tile.BottomElementID];
            }
            else
            {
                this._warn("Warning: No Element definintion '" + tile.BottomElementID + "' for Tile: ", tile);
            }
        }

        if ((tile.MiddleElementID !== undefined) && (tile.MiddleElementID != null) && (tile.MiddleElementID != ""))
        {
            if (this._elements[tile.MiddleElementID] !== undefined)
            {
                tile.MiddleElement = this._elements[tile.MiddleElementID];
            }
            else
            {
                this._warn("Warning: No Element definintion '" + tile.MiddleElementID + "' for Tile: ", tile);
            }
        }

        if ((tile.TopElementID !== undefined) && (tile.TopElementID != null) && (tile.TopElementID != ""))
        {
            if (this._elements[tile.TopElementID] !== undefined)
            {
                tile.TopElement = this._elements[tile.TopElementID];
            }
            else
            {
                this._warn("Warning: No Element definintion '" + tile.TopElementID + "' for Tile: ", tile);
            }
        }


        return tile;
    }

    private _renderMap = function (callback)
    {
        //this._log("Map rendering ...");

        this._clear(this._layer.BottomStaticLayer.ctx);
        this._clear(this._layer.MiddleStaticLayer.ctx);
        this._clear(this._layer.TopStaticLayer.ctx);


        function okCallback()
        {
            window.setTimeout(callback, 1);

            this._staticRendered = true;

        }

        for (var collom = 0; collom < this._map.length; collom++)
        {
            //_log("Row: ", collom);

            var yOffset = collom * this._config.tileSize; // - _offset.y;

            for (var element = 0; element < this._map[collom].length; element++)
            {
                //_log("Element: ", element);

                var xOffset = element * this._config.tileSize; // - _offset.x;

                //_log(xOffset);


                this._map[collom][element].X = xOffset;
                this._map[collom][element].Y = yOffset;

                //if ((((xOffset + _config.tileSize) < _offset.x) || ((yOffset + _config.tileSize) < _offset.y)) || ((xOffset + _offset.x > _width) || (yOffset + _offset.y > _height)))
                //{
                //_log("Tile out of sight: ", _map[collom][element]);
                //continue;
                //}

                if (
                    ((xOffset + this._config.tileSize) < this._offset.x) ||
                    (yOffset + this._config.tileSize) < this._offset.y //||
                //(xOffset > ( _width + _offset.x))

                    )
                {
                    continue;
                }


                this._addTile(this._map[collom][element], xOffset, yOffset, false, ((collom == this._map.length - 1) && (element == this._map[collom].length - 1)) ? okCallback : undefined);
            }


        }

    }

    private _renderDynamic = function ()
    {
        /*
        _clear(_layer.PlayerLayer.ctx);

        _layer.PlayerLayer.ctx.fillStyle = "orange";
        _layer.PlayerLayer.ctx.fillRect(10, 10, 100, 100);
        _layer.PlayerLayer.ctx.fill();
        */
    }


        private _render = function ()
    {
        var self: Renderer = this;

        var combine = function ()
        {
            // Clear the Buffer:
            self._clear(self._bufferCtx);
            //_clear(_ctx);

            //console.log("Combine");

            // Combine Layer:
            self._bufferCtx.drawImage(self._layer.BottomStaticLayer.canvas, 0, 0);
            self._bufferCtx.drawImage(self._layer.MiddleStaticLayer.canvas, 0, 0);
            self._bufferCtx.drawImage(self._layer.PlayerLayer.canvas, 0, 0);
            self._bufferCtx.drawImage(self._layer.AnimationLayer.canvas, 0, 0);
            self._bufferCtx.drawImage(self._layer.TopStaticLayer.canvas, 0, 0);


            window.setTimeout(function ()
            {
                self._ctx.drawImage(self._bufferCanvas, self._offset.x * -1, self._offset.y * -1);

            }, 2);
        }

        this._renderDynamic();

        if (!this._staticRendered)
        {
            // Trigger MapRender
            this._renderMap(combine);
        }
        else
        {
            combine();
        }

    }


    // -------------

    public test = function (offset)
    {


        this._offset.x = offset;
        this._offset.y = 0;

        this._render();
    }




    // --- Draw Functions ----
    private _clear = function (ctx: CanvasRenderingContext2D)
    {
        /*ctx.rect(0, 0, _width, _height);
        ctx.fillStyle = 'green';
        ctx.fill();*/

        ctx.clearRect(0, 0, this._width, this._height);
    }



    private _addTile = function (tile, x, y, ignoreOutOfSight, readyCallback)
    {
        //_log("Render Tile: ", tile);

        var bottom = tile.BottomElement;
        var middle = tile.MiddleElement;
        var top = tile.TopElement;

        var callback = function (where)
        {

            if ((bottom === undefined) && (middle === undefined) && (top === undefined))
            {
                return readyCallback;
            }
            else if ((bottom !== undefined) && (middle === undefined) && (top === undefined) && (where == "bottom"))
            {
                return readyCallback;
            }
            else if ((bottom !== undefined) && (middle !== undefined) && (top === undefined) && (where == "middle"))
            {
                return readyCallback;
            }
            else if ((bottom !== undefined) && (top !== undefined) && (where == "top"))
            {
                return readyCallback;
            }
            else
            {
                return undefined;
            }

        }


        if (bottom !== undefined)
        {
            this._addImage(this._layer.BottomStaticLayer.ctx, bottom.ImageURI, x, y, undefined, undefined, callback("bottom"), ignoreOutOfSight);
        }
        if (middle !== undefined)
        {
            this._addImage(this._layer.MiddleStaticLayer.ctx, middle.ImageURI, x, y, undefined, undefined, callback("middle"), ignoreOutOfSight);
        }
        if (top !== undefined)
        {
            this._addImage(this._layer.TopStaticLayer.ctx, top.ImageURI, x, y, undefined, undefined, callback("top"), ignoreOutOfSight);
        }

        var old = function ()
        {
            /*
            var topCallback = function ()
            {
                if ((_config.showBlocking) && (!tile.Passable))
                {
                    ctx.strokeStyle = "#f00";
                    ctx.strokeRect(x, y, _config.tileSize, _config.tileSize);
                }

                if (readyCallback !== undefined)
                {
                    readyCallback();
                }
            }

            var middleCallback = function ()
            {
                if (top != undefined)
                {
                    _addImage(ctx, top.ImageURI, x, y, undefined, undefined, topCallback, ignoreOutOfSight);
                }
                else
                {
                    if ((_config.showBlocking) && (!tile.Passable))
                    {
                        ctx.strokeStyle = "#f00";
                        ctx.strokeRect(x, y, _config.tileSize, _config.tileSize);
                    }

                    if (readyCallback !== undefined)
                    {
                        readyCallback();
                    }
                }
            }

            var bottomCallback = function ()
            {
                if (middle !== undefined)
                {
                    _addImage(ctx, middle.ImageURI, x, y, undefined, undefined, middleCallback, ignoreOutOfSight);
                }
                else if (top !== undefined)
                {
                    _addImage(ctx, top.ImageURI, x, y, undefined, undefined, topCallback, ignoreOutOfSight);
                }
                else
                {
                    if ((_config.showBlocking) && (!tile.Passable))
                    {
                        ctx.strokeStyle = "#f00";
                        ctx.strokeRect(x, y, _config.tileSize, _config.tileSize);
                    }

                    if (readyCallback !== undefined)
                    {
                        readyCallback();
                    }
                }

            }

            _addImage(ctx, bottom.ImageURI, x, y, undefined, undefined, bottomCallback, ignoreOutOfSight);
            */
        };
    }

    private _addImage = function (ctx, src, x, y, width, height, imageOnLoad, ignoreOutOfSight)
    {
        // _log("Add Image '" + src + "' at: ", { x: x, y: y });

        ignoreOutOfSight = (ignoreOutOfSight === undefined) ? false : Boolean(ignoreOutOfSight);

        if (!ignoreOutOfSight && ((((x + width) < 0) && ((y + height) < 0)) || ((x > this._width) && (y > this._height))))
        {
            //_log("Out of sight!");
            return;
        }

        var imageObj = new Image();

        if (typeof (width) == "undefined")
        {
            width = this._config.tileSize;
        }

        if (typeof (height) == "undefined")
        {
            height = this._config.tileSize;
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

            /*if (_ShowBlocking && config.blocking)
            {

                _ctx.strokeStyle = "#f00";
                _ctx.strokeRect(x, y, width, height);
            }
            */
        };

        imageObj.src = src;
    }


    // --- Helper Functions ----

    private _getFile = function (url, callback, dataType)
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

    private _log = function (message, objects)
    {
        if (this._config.debug)
        {
            console.log(message, objects);
        }
    }

    private _info = function (message, objects)
    {
        if (this._config.debug)
        {
            console.info(message, objects);
        }
    }

    private _warn = function (message, objects)
    {
        if (this._config.debug)
        {
            console.warn(message, objects);
        }
    }

    private _error = function (message, objects)
    {
        if (this._config.debug)
        {
            console.error(message, objects);
        }
    }



}
