function Renderer(__canvas, __gameHandler, __eventHandler, __config)
{
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

    // Variables
    var _canvas;
    var _ctx;

    var _bufferCanvas;
    var _bufferCtx;

    var _layer =
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

    var _width = 0;
    var _height = 0;

    var _staticWidth = 0;
    var _staticHeight = 0;
    var _staticRendered = false;

    var _elements = {};
    var _map = [];

    var _offset = {
        x: 0,
        y: 0
    }

    var _eventHandler = null;
    var _gameHandler = null;


    // Constructor ---------

    var _init = function ()
    {
        _eventHandler = __eventHandler;
        if (_eventHandler === undefined)
        {
            console.warn("Third Argument of Renderer is undefined.");
            return;
        }

        _gameHandler = __gameHandler;
        if (_gameHandler === undefined)
        {
            console.warn("Second Argument of Renderer is undefined.");
            return;
        }

        _eventHandler.callEvent("renderPreInit", this, null);

        _canvas = __canvas;
        _config = $.extend(_config, __config);

        _width = _config.width;
        _height = _config.height;
        _ctx = _canvas.getContext("2d")

        $(_canvas)
            .attr("width", _width)
            .attr("height", _height);


        _loadConfig();
        _loadMap();

        _eventHandler.addEventListener("forceRerender", function ()
        {
            _render();
        });

        _eventHandler.callEvent("renderPostInit", this, null);

    }


    var _initLayer = function ()
    {
        // Init Layer:
        $.each(_layer, function (k, el)
        {
            _layer[k].canvas = document.createElement("canvas");
            $(_layer[k].canvas)
                .attr("width", _staticWidth)
                .attr("height", _staticHeight);

            _layer[k].ctx = _layer[k].canvas.getContext("2d");
        });



        _bufferCanvas = document.createElement("canvas");
        $(_bufferCanvas)
            .attr("width", _staticWidth)
            .attr("height", _staticHeight);

        _bufferCtx = _bufferCanvas.getContext("2d");


    }


    // ---- Config Handler ----

    var _loadConfig = function ()
    {
        _eventHandler.callEvent("renderPreConfigLoad", this, null);

        _log("Load Config from path: ", _config.elementsPath);

        var result = _getFile(_config.elementsPath);

        $.each(result, function (_, el)
        {
            _elements[el.ID] = el;
        });

        _log("Element Definitions loaded: ", _elements);

        _eventHandler.callEvent("renderPostConfigLoad", this, null);
    }

    var _loadMap = function ()
    {
        _eventHandler.callEvent("renderPreMapLoad", this, null);

        _log("Load Map from path:", _config.mapPath);

        var result = _getFile(_config.mapPath);

        for (y = 0; y < result.length; y++)
        {
            var collom = result[y];

            for (x = 0; x < collom.length; x++)
            {
                result[y][x] = _updateTile(result[y][x]);
            }

        }
        _map = result;

        _staticHeight = _map.length * _config.tileSize;
        _staticWidth = _map[0].length * _config.tileSize;

        _initLayer();

        _log("Map Loaded: ", _map);

        _eventHandler.callEvent("renderPostMapLoad", this, null);
    }

    var _updateTile = function (tile)
    {
        if ((tile.BottomElementID !== undefined) && (tile.BottomElementID != null) && (tile.BottomElementID != ""))
        {
            if (_elements[tile.BottomElementID] !== undefined)
            {
                tile.BottomElement = _elements[tile.BottomElementID];
            }
            else
            {
                _warn("Warning: No Element definintion '" + tile.BottomElementID + "' for Tile: ", tile);
            }
        }

        if ((tile.MiddleElementID !== undefined) && (tile.MiddleElementID != null) && (tile.MiddleElementID != ""))
        {
            if (_elements[tile.MiddleElementID] !== undefined)
            {
                tile.MiddleElement = _elements[tile.MiddleElementID];
            }
            else
            {
                _warn("Warning: No Element definintion '" + tile.MiddleElementID + "' for Tile: ", tile);
            }
        }

        if ((tile.TopElementID !== undefined) && (tile.TopElementID != null) && (tile.TopElementID != ""))
        {
            if (_elements[tile.TopElementID] !== undefined)
            {
                tile.TopElement = _elements[tile.TopElementID];
            }
            else
            {
                _warn("Warning: No Element definintion '" + tile.TopElementID + "' for Tile: ", tile);
            }
        }


        return tile;
    }

    var _renderMap = function (callback)
    {
        _eventHandler.callEvent("renderPreMapRender", this, null);

        _log("Map rendering ...");

        _clear(_layer.BottomStaticLayer.ctx);
        _clear(_layer.MiddleStaticLayer.ctx);
        _clear(_layer.TopStaticLayer.ctx);


        function okCallback()
        {
            window.setTimeout(callback, 1);

            _staticRendered = true;

        }

        for (collom = 0; collom < _map.length; collom++)
        {
            //_log("Row: ", collom);

            var yOffset = collom * _config.tileSize; // - _offset.y;

            for (element = 0; element < _map[collom].length; element++)
            {
                //_log("Element: ", element);

                var xOffset = element * _config.tileSize; // - _offset.x;

                //_log(xOffset);


                _map[collom][element].X = xOffset;
                _map[collom][element].Y = yOffset;

                //if ((((xOffset + _config.tileSize) < _offset.x) || ((yOffset + _config.tileSize) < _offset.y)) || ((xOffset + _offset.x > _width) || (yOffset + _offset.y > _height)))
                //{
                //_log("Tile out of sight: ", _map[collom][element]);
                //continue;
                //}

                if (
                        ((xOffset + _config.tileSize) < _offset.x) ||
                        (yOffset + _config.tileSize) < _offset.y //||
                    //(xOffset > ( _width + _offset.x))

                    )
                {
                    continue;
                }


                _addTile(_map[collom][element], xOffset, yOffset, false, ((collom == _map.length - 1) && (element == _map[collom].length - 1)) ? okCallback : undefined);
            }


        }

        _eventHandler.callEvent("renderPostMapRender", this, null);
    }

    var _renderDynamic = function ()
    {
        _eventHandler.callEvent("render", this, _layer);
    }


    var _render = function ()
    {
        _eventHandler.callEvent("renderPreRender", this, null);
        var combine = function ()
        {
            // Clear the Buffer:
            _clear(_bufferCtx);
            //_clear(_ctx);

            //console.log("Combine");

            // Combine Layer:
            _bufferCtx.drawImage(_layer.BottomStaticLayer.canvas, 0, 0);
            _bufferCtx.drawImage(_layer.MiddleStaticLayer.canvas, 0, 0);
            _bufferCtx.drawImage(_layer.PlayerLayer.canvas, 0, 0);
            _bufferCtx.drawImage(_layer.AnimationLayer.canvas, 0, 0);
            _bufferCtx.drawImage(_layer.TopStaticLayer.canvas, 0, 0);


            window.setTimeout(function ()
            {
                _ctx.drawImage(_bufferCanvas, _offset.x * -1, _offset.y * -1);

            }, 2);
        }

        _renderDynamic();

        if (!_staticRendered)
        {
            // Trigger MapRender
            _renderMap(combine);
        }
        else
        {
            combine();
        }

        _eventHandler.callEvent("renderPostRender", this, null);
    }


    // -------------

    this.test = function (offset)
    {


        _offset.x = offset;
        _offset.y = 0;

        _render();
    }

    this.getAnimationLayer = function ()
    {
        return _layer.AnimationLayer;
    }

    this.getPlayerLayer = function ()
    {
        return _layer.PlayerLayer;
    }


    this.getTileSize = function()
    {
        return _config.tileSize;
    }


    // --- Draw Functions ----
    var _clear = function (ctx)
    {
        /*ctx.rect(0, 0, _width, _height);
        ctx.fillStyle = 'green';
        ctx.fill();*/

        ctx.clearRect(0, 0, _staticWidth, _staticHeight);
    }

    this.clearRenderContext = function(ctx)
    {
        _clear(ctx);
    }


    var _addTile = function (tile, x, y, ignoreOutOfSight, readyCallback)
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
            _addImage(_layer.BottomStaticLayer.ctx, bottom.ImageURI, x, y, undefined, undefined, callback("bottom"), ignoreOutOfSight);
        }
        if (middle !== undefined)
        {
            _addImage(_layer.MiddleStaticLayer.ctx, middle.ImageURI, x, y, undefined, undefined, callback("middle"), ignoreOutOfSight);
        }
        if (top !== undefined)
        {
            _addImage(_layer.TopStaticLayer.ctx, top.ImageURI, x, y, undefined, undefined, callback("top"), ignoreOutOfSight);
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

    var _addImage = function (ctx, src, x, y, width, height, imageOnLoad, ignoreOutOfSight)
    {
        // _log("Add Image '" + src + "' at: ", { x: x, y: y });

        ignoreOutOfSight = (ignoreOutOfSight === undefined) ? false : Boolean(ignoreOutOfSight);

        if (!ignoreOutOfSight && ((((x + width) < 0) && ((y + height) < 0)) || ((x > _width) && (y > _height))))
        {
            //_log("Out of sight!");
            return;
        }

        var imageObj = new Image();

        if (typeof (width) == "undefined")
        {
            width = _config.tileSize;
        }

        if (typeof (height) == "undefined")
        {
            height = _config.tileSize;
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

    var _getFile = function (url, callback, dataType)
    {
        /*
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
        */

        return _gameHandler.getFile(url, callback, dataType);

    }

    var _log = function (message, objects)
    {
        _gameHandler.log(message, objects);


        /*
        if (_config.debug)
        {
            console.log(message, objects);
        }
        */
    }

    var _info = function (message, objects)
    {
        _gameHandler.info(message, objects);
    }
    
    var _warm = function (message, objects)
    {
        _gameHandler.warn(message, objects);
    }


    var _error = function (message, objects)
    {
        _gameHandler.error(message, objects);
    }



    // -------
    _init();
}