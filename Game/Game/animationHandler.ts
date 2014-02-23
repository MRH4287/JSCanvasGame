/// <reference path="jquery.d.ts" />
/// <reference path="eventHandler.ts" />
/// <reference path="gameHandler.ts" />
/// <reference path="renderer.d.ts" />

class AnimationHandler
{
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    private eventHandler: EventHandler;
    private renderer: Renderer;
    private gameHandler: GameHandler;

    private width: number;
    private height: number;

    private spriteContainer: { [id: string]: HTMLElement };
    private animations: { [id: string]: InternalAnimationContainer } = {};

    private playableAnimations: { [id: string]: PlayableAnimation } = {};


    constructor(data: {
        eventHandler: EventHandler;
        renderer: Renderer;
        gameHandler: GameHandler;
    })
    {
        this.eventHandler = data.eventHandler;
        this.spriteContainer = {};
        this.renderer = data.renderer;
        this.gameHandler = data.gameHandler;

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
        this.loadAnimation("data/animations/pichu.json");

        this.addAnimation("test", "pichu", "sleep", 6, 6);

        console.log(this.playableAnimations);

        var self = this;
        //ForceRerender
        window.setTimeout(function ()
        {
            //self.eventHandler.callEvent("forceRerender", this, null);

        }, 10);


    }

    public addAnimation(ElementID: string, containerName: string, startAnimation: string, x: number, y: number)
    {
        var container: InternalAnimationContainer = this.animations[containerName];
        var animation: Animation = container.Animations[startAnimation];

        var element: PlayableAnimation =
            {
                ID: ElementID,
                AnimationContainer: container,
                X: x,
                Y: y,
                Animation: null
            };

        this.playableAnimations[ElementID] = element;

        this.playAnimation(ElementID, startAnimation);
        // TODO: Add Timed Event for Animation!


    }

    private getNewAnimationInstance(input: Animation): Animation
    {
        return <Animation>jQuery.extend({}, input);
    }

    private playAnimation(elementID: string, animation: string)
    {
        var container: PlayableAnimation = this.playableAnimations[elementID];

        if ((container.Animation != null) && (container.Animation.ID == animation))
        {
            this.gameHandler.warn("Animation '" + animation + "' is allready running for '" + elementID + "'");
            return;
        }


        this.stopAnimation(elementID);

        var newAnimation = this.getNewAnimationInstance(container.AnimationContainer.Animations[animation]);
        container.Animation = newAnimation;

        var timerName = "anim-" + container.ID + "-" + container.Animation.ID;

        //this.gameHandler.log(timerName);
        //this.gameHandler.log(container);

        if ((newAnimation.ImageCount > 0) && (newAnimation.Speed > 0))
        {

            var self = this;
            this.eventHandler.addTimer(timerName, function ()
            {
                //self.gameHandler.log("Timer Event for: ", timerName);

                self.animationStep(container);

            }, newAnimation.Speed);
        }
    }

    private stopAnimation(elementID: string)
    {
        var container: PlayableAnimation = this.playableAnimations[elementID];

        if (container.Animation == null)
        {
            return;
        }

        // Remove Timer for Animation:
        var timerName = "anim-" + container.ID + "-" + container.Animation.ID;
        if (this.eventHandler.containesKey(timerName))
        {
            this.eventHandler.stopTimer(timerName);
        }
    }

    private animationStep(animation: PlayableAnimation)
    {
        var anim: Animation = animation.Animation;
        var state: number = anim.AnimationState;

        state += (anim.IsReverse) ? -1 : 1;

        if ((state >= anim.ImageCount) || (state < 0))
        {
            // End of Animation reached:
            if (anim.Loop)
            {
                if (anim.ReverseOnEnd)
                {
                    if (anim.IsReverse)
                    {
                        anim.AnimationState = 0;
                        anim.IsReverse = false;
                    }
                    else
                    {
                        anim.AnimationState = anim.ImageCount - 1;
                        anim.IsReverse = true;
                    }
                }
                else
                {
                    if (anim.IsReverse)
                    {
                        anim.AnimationState = anim.ImageCount - 1;
                    }
                    else
                    {
                        anim.AnimationState = 0;
                    }
                }
            }
            else
            {
                this.stopAnimation(animation.ID);
            }

        }
        else
        {
            anim.AnimationState = state;
        }
        
        this.eventHandler.callEvent("forceRerender", this, null);

    }


    private loadAnimation(path)
    {
        var data: AnimationContainer = <AnimationContainer>this.gameHandler.getFile(path);

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

    private getPosition(x: number, y: number): { x: number; y: number }
    {
        var tileSize: number = this.renderer.getTileSize();
        var result =
            {
                x: ((x - 1) * tileSize),
                y: ((y - 1) * tileSize)
            };

        return result;
    }


    private renderAnimations()
    {
        this.renderer.clearRenderContext(this.ctx);

        // Debug Code:
        //this.drawImage("pichu", 4, 5, 32, 32, 0, 0, 32, 32);

        var self = this;
        $.each(this.playableAnimations, function (id: string, el: PlayableAnimation) 
        {
            var pos = self.getPosition(el.X, el.Y);
            self.renderAninmation(el.AnimationContainer, el.Animation, pos.x, pos.y);
        });

        /*
        if (this.animations["pichu"] !== undefined)
        {
            this.gameHandler.log("Drawing Animation ...");

           

            var anim: InternalAnimationContainer = this.animations["pichu"];
            this.renderAninmation(anim, anim.Animations["sleep"], pos.x, pos.y);
        }
        */

    }

    private renderAninmation(container: InternalAnimationContainer, animation: Animation, x: number, y: number)
    {
        var imageID = container.ID;

        var imageX = animation.StartX + (animation.OffsetX) * animation.AnimationState;
        var imageY = animation.StartY + (animation.OffsetY) * animation.AnimationState;

        var tileSize: number = this.renderer.getTileSize();

        var width = animation.DisplayWidth * tileSize;
        var height = animation.DisplayHeight * tileSize;

        //this.gameHandler.log(animation);
        //this.gameHandler.log("ImageID = ['" + imageID + "'], imageX = ['" + imageX + "'], imageY = ['" + imageY + "'], width = ['" + width + "'], height = ['" + height + "']");

        var xPos = x + animation.DisplayOffsetX * tileSize;
        var yPos = y + animation.DisplayOffsetY * tileSize;


        this.drawImage(imageID, imageX, imageY, animation.ImageWidth, animation.ImageHeight, xPos, yPos, width, height);

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

interface PlayableAnimation
{
    ID: string;
    AnimationContainer: InternalAnimationContainer;
    Animation: Animation;
    X: number;
    Y: number;
}

interface Animation
{
    // The ID of the Aninamtion
    ID: string;
    // How many Images are in this Animation
    ImageCount: number;
    // X-Coordinate of the first frame
    StartX: number;
    // Y-Coordinate of the firsr frame
    StartY: number;
    // The Height of a Frame
    ImageHeight: number;
    // The Width of a Frame
    ImageWidth: number;
    // The factor the tileSize is multiplied to get the height
    DisplayHeight: number;
    // The factor the tileSize is multiplied to get the width
    DisplayWidth: number;
    // The X-Distance between two Frames
    OffsetX: number;
    // The Y-Distance between two Frames
    OffsetY: number;
    // The X-Offset from the Start of the Tile
    DisplayOffsetX: number;
    // The Y-Offset from the Start of the Tile
    DisplayOffsetY: number;
    // The Speed the Animation runs
    Speed: number;
    // Reverse Animation on End
    ReverseOnEnd: boolean;
    //Is the Animation on Reverse
    IsReverse: boolean;
    // Loop the Animation on End
    Loop: boolean;
    // The Current displayed Frame of the Animation
    AnimationState: number;
}


interface AnimationContainer
{
    // The ID of the Animation Container
    ID: string;
    // The Path to the Spritesheet
    ImageURI: string;
    //The Animations of this Container
    Animations: Animation[]
}

interface InternalAnimationContainer
{
    // The ID of the Animation Container
    ID: string;
    // The Path to the Spritesheet
    ImageURI: string;
    //The Animations of this Container
    Animations: { [id: string]: Animation };
}