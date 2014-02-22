/// <reference path="jquery.d.ts" />
/// <reference path="eventHandler.ts" />
/// <reference path="renderer.d.ts" />

class AnimationHandler
{
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    private eventHandler: EventHandler;
    private renderer: Renderer;

    private width: number;
    private height: number;

    private spriteContainer: { [id: string]: HTMLElement };

    constructor(data: {
        eventHandler: EventHandler;  
        renderer: Renderer;
    })
    {
        this.eventHandler = data.eventHandler;
        this.spriteContainer = {};
        this.renderer = data.renderer;

        var self = this;
        this.eventHandler.addEventListener("render", function ()
        {
            self.renderAnimations();
        });


        
    }

    public setLayer(layer: RendererLayer)
    {
        this.canvas = layer.canvas;
        this.ctx = layer.ctx;

        var el = $(this.canvas);
        this.width = el.width();
        this.height = el.height();
    }

    public test()
    {
        this.preloadImage("pichu", "graphics/animations/pichu.png");

        var self = this;
        //ForceRerender
        window.setTimeout(function ()
        {
            self.eventHandler.callEvent("forceRerender", this, null);

        }, 10);


    }

    private renderAnimations()
    {
        this.renderer.clearRenderContext(this.ctx);

        // Debug Code:
        this.drawImage("pichu", 4, 5, 32, 32, 0, 0, 32, 32);

    }

    private preloadImage(name: string, path: string)
    {
        var self = this;
        this.loadImage(path, function (result)
        {
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


    private drawImage(name: string, offsetX: number, offsetY: number, width?: number, height?: number, canvasOffsetX?: number, canvasOffsetY?: number, canvasImageWidth?: number, canvasImageHeight?: number)
    {
        if (this.spriteContainer[name] === undefined)
        {
            console.warn("No sprite with name '" + name + "' was found!");
            return;
        }

        this.ctx.drawImage(this.spriteContainer[name], offsetX, offsetY, width, height, canvasOffsetX, canvasOffsetY, canvasImageWidth, canvasImageHeight);
    }


}