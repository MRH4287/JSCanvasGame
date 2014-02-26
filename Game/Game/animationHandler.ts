/// <reference path="jquery.d.ts" />
/// <reference path="eventHandler.ts" />
/// <reference path="gameHandler.ts" />
/// <reference path="interfaces.ts" />

class AnimationHandler
{
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    private eventHandler: EventHandler;
    private renderer: Renderer;
    private gameHandler: GameHandler;

    private width: number;
    private height: number;

    // The Layer this Animation Handler listens on ...
    private layer: number;

    public playableAnimations: { [id: string]: PlayableAnimation } = {};

    constructor(gameHandler: GameHandler, layer: number)
    {
        this.eventHandler = gameHandler.eventHandler;
        this.renderer = gameHandler.renderer;
        this.gameHandler = gameHandler;

        //gameHandler.setAnimationHandler(this);


        this.layer = layer;

        var self = this;
        this.eventHandler.addEventListener("render", function ()
        {
            self.renderAnimations(self);
        });

        this.eventHandler.addEventListener("postTileUpdate", function (sender, tile)
        {
            self.tileUpdate(tile);
        });


    }

    public setLayer(layer: RendererLayer)
    {
        this.gameHandler.log("Animation: Layer set ... ", layer);

        this.canvas = layer.canvas;
        this.ctx = layer.ctx;

        var el = $(this.canvas);
        this.width = el.width();
        this.height = el.height();



        console.log("Animation Handler: ", this);
    }



    private tileUpdate(tile: Tile)
    {
        var dynamic: boolean = false;

        var def: ElementDefinition = null;
        var defLayer: number = null;

        //this.gameHandler.log("Got Tile to update: (X: " + tile.XCoord + ", Y: " + tile.YCoord +") ", tile);

        if ((tile.BottomElement !== undefined) && (tile.BottomElement.Dynamic !== undefined) && (tile.BottomElement.Dynamic == true))
        {
            dynamic = true;
            def = tile.BottomElement;
            defLayer = 0;
        }
        if ((tile.MiddleElement !== undefined) && (tile.MiddleElement.Dynamic !== undefined) && (tile.MiddleElement.Dynamic == true))
        {
            if (dynamic)
            {
                this.gameHandler.warn("Only one Animation per Tile possible!", tile.MiddleElement.AnimationContainer);
                this.gameHandler.info("Alread set: ", def.AnimationContainer);
            }
            else
            {
                dynamic = true;
                def = tile.MiddleElement;
                defLayer = 1;
            }
        }
        if ((tile.TopElement !== undefined) && (tile.TopElement.Dynamic !== undefined) && (tile.TopElement.Dynamic == true))
        {
            if (dynamic)
            {
                this.gameHandler.warn("Only one Animation per Tile possible!", tile.TopElement.AnimationContainer);
                this.gameHandler.info("Alread set: ", def.AnimationContainer);
            }
            else
            {
                dynamic = true;
                def = tile.TopElement;
                defLayer = 2;
            }
        }


        if (dynamic) // && )
        {
            if (def.Level == this.layer)
            {
                this.gameHandler.log("Load Animation for item: ", tile);

                var id = ((tile.ID === undefined) || (tile.ID == null) || (tile.ID == "")) ? "ent-" + def.ID + "-" + Math.random() + "-" + Math.random() : "ent-" +tile.ID;

                this.gameHandler.log(this.gameHandler.animations);

                tile.Animation = this.addAnimation(id, def.AnimationContainer, def.DefaultAnimation, tile.XCoord, tile.YCoord);
                
            }
            else
            {
                this.gameHandler.log("Ignore Dynamic Element .. not in the same layer ...");
            }
        }



    }


    public test()
    {
        this.gameHandler.loadAnimation("data/animations/pichu.json");

        this.addAnimation("test", "pichu", "sleep", 6, 6);

        console.log(this.playableAnimations);

        var self = this;
        //ForceRerender
        window.setTimeout(function ()
        {
            //self.eventHandler.callEvent("forceRerender", this, null);

        }, 10);


    }

    public addAnimation(ElementID: string, containerName: string, startAnimation: string, x: number, y: number): PlayableAnimation
    {
        this.gameHandler.log("Add Animation for: ", containerName, this.gameHandler.animations[containerName]);
        this.gameHandler.log("Default Animation: ", startAnimation);
        this.gameHandler.log({"X": x, " Y": y });

        var container: InternalAnimationContainer = this.gameHandler.animations[containerName];
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

        return element;
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
            this.gameHandler.log("Dynamic Animation. Start timer: ", timerName);

            var self = this;
            this.eventHandler.addTimer(timerName, function ()
            {
                //self.gameHandler.log("Timer Event for: ", timerName);

                self.animationStep(container);

            }, newAnimation.Speed);
        }
        else
        {
            this.gameHandler.log("Satic Animation applied ....");
        }

        this.eventHandler.callEvent("forceRerender", this, null);

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

        this.eventHandler.stopTimer(timerName);

        container.Animation = null;
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


    private renderAnimations(self)
    {
        if (self.ctx == null)
        {
            self.gameHandler.warn("Animation: No render Context found!", self);

            return;
        }

        self.eventHandler.callEvent("animationsPreRender", self, null);

        self.renderer.clearRenderContext(self.ctx);

        // Debug Code:
        //this.drawImage("pichu", 4, 5, 32, 32, 0, 0, 32, 32);


        $.each(self.playableAnimations, function (id: string, el: PlayableAnimation) 
        {
            var pos = self.getPosition(el.X, el.Y);
            self.renderAninmation(el.AnimationContainer, el.Animation, pos.x, pos.y);
        });

        self.eventHandler.callEvent("animationsPostRender", self, null);

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




    private drawImage(name: string, offsetX: number, offsetY: number, width?: number, height?: number, canvasOffsetX?: number, canvasOffsetY?: number, canvasImageWidth?: number, canvasImageHeight?: number)
    {
        if (this.gameHandler.spriteContainer[name] === undefined)
        {
            console.warn("No sprite with name '" + name + "' was found!");
            return;
        }

        this.ctx.drawImage(this.gameHandler.spriteContainer[name], offsetX, offsetY, width, height, canvasOffsetX, canvasOffsetY, canvasImageWidth, canvasImageHeight);
    }


}

