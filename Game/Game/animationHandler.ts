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

    private animationGroups: { [id: string]: any[] } = {};

    private UseAnimationGroups: boolean = true;
    private staticName: string = null;

    constructor(gameHandler: GameHandler, layer: number, staticName?: string)
    {
        if (staticName !== undefined)
        {
            this.UseAnimationGroups = false;
            this.staticName = staticName;
        }

        this.eventHandler = gameHandler.eventHandler;
        this.renderer = gameHandler.renderer;
        this.gameHandler = gameHandler;

        //gameHandler.setAnimationHandler(this);


        this.layer = layer;

        var self = this;
        this.eventHandler.addEventListener("render", function ()
        {
            if (self.gameHandler.config.playStaticAnimations)
            {
                self.renderAnimations(self);
            }
        });

        this.eventHandler.addEventListener("postTileUpdate", function (sender, tile)
        {
            if (self.gameHandler.config.initStaticAnimations)
            {
                self.tileUpdate(tile);
            }
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

    public setPosition(elementName: string, x: number, y: number)
    {
        if (this.playableAnimations[elementName] !== undefined)
        {
            this.playableAnimations[elementName].X = x;
            this.playableAnimations[elementName].Y = y;

            this.eventHandler.callEvent("forceRerender", this, null);
        }
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

                var id = ((tile.ID === undefined) || (tile.ID == null) || (tile.ID == "")) ? "ent-" + def.ID + "-" + Math.random() + "-" + Math.random() : "ent-" + tile.ID;

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
        this.gameHandler.log({ "X": x, " Y": y });

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

        if ((animation.AnimationGroup === undefined) || (animation.AnimationGroup == null) || (animation.AnimationGroup == ""))
        {
            animation.AnimationGroup = "group-" + ElementID;
        }
        else if (animation.AnimationGroup == "@")
        {
            animation.AnimationGroup = "group-" + Math.random() + Math.random();
        }

        this.playAnimation(ElementID, startAnimation, animation.AnimationGroup);

        return element;
    }

    private getNewAnimationInstance(input: Animation): Animation
    {
        return <Animation>jQuery.extend({}, input);
    }

    public playAnimation(elementID: string, animation: string, group: string)
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

        var timerName = (this.UseAnimationGroups) ? ("anim-" + container.ID + "-" + group) : this.staticName;
        if (!this.UseAnimationGroups)
        {
            group = this.staticName;
        }

        //this.gameHandler.log(timerName);
        //this.gameHandler.log(container);

        if ((group === undefined) || (group == null) || (group == ""))
        {
            group = "group-" + Math.random();
        }

        if (this.gameHandler.config.verbose)
        {
            this.gameHandler.log("Animation Group: ", group);
        }

        if ((newAnimation.ImageCount > 0) && (newAnimation.Speed > 0))
        {
            var self = this;

            if (this.animationGroups[group] === undefined)
            {
                this.gameHandler.log("Dynamic Animation. Start timer: ", timerName);

                this.animationGroups[group] = []


                this.eventHandler.addTimer(timerName, function ()
                {
                    for (var i = 0; i < self.animationGroups[group].length; i++)
                    {
                        self.animationGroups[group][i]();
                    }

                    self.eventHandler.callEvent("forceRerender", this, null);


                }, newAnimation.Speed);

            }

            this.animationGroups[group].push(function ()
            {
                self.animationStep(container);
            });

        }
        else
        {
            if (this.gameHandler.config.verbose)
            {
                this.gameHandler.log("Satic Animation applied ....");
            }
        }

        this.eventHandler.callEvent("forceRerender", this, null);

    }

    public stopAnimation(elementID: string)
    {
        if (this.UseAnimationGroups)
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
        else
        {
            var timerName = this.staticName;
            var group = this.staticName;

            this.eventHandler.stopTimer(timerName);
            var container: PlayableAnimation = this.playableAnimations[elementID];

            container.Animation = null;

            this.animationGroups[group] = undefined;

        }

    }

    private animationStep(animation: PlayableAnimation)
    {
        if (animation == null)
        {
            return;
        }

        var anim: Animation = animation.Animation;

        if (anim == null)
        {
            return;
        }

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
        if (animation == null)
        {
            return;
        }

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

