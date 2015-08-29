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
    private animationGroups: { [id: string]: { [index: string]: boolean } } = {}; // { [id: string]: { (): void } }

    private useAnimationGroups: boolean = true;
    private staticName: string = null;

    private genericDrawActions: {
        [index: string]: {
            Type: string;
            Action: () => void
        }
    } = {};

    constructor(gameHandler: GameHandler, layer: number, staticName?: string)
    {
        if (staticName !== undefined)
        {
            this.useAnimationGroups = false;
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

            $.each(self.genericDrawActions, function (name, data)
            {
                if (self.gameHandler.config.verbose)
                {
                    self.gameHandler.log("Draw Generic Action: ", data, self);
                }

                data.Action();
            });


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
        //this.gameHandler.log("Animation: Layer set ... ", layer);

        this.canvas = layer.canvas;
        this.ctx = layer.ctx;

        var el = $(this.canvas);
        this.width = el.width();
        this.height = el.height();



        //console.log("Animation Handler: ", this);
    }

    public clear()
    {
        var self = this;

        $.each(this.playableAnimations, function (id, el: PlayableAnimation)
        {
            self.stopAnimation(id);
            self.stopAnimation(el.ID);
        });

        $.each(this.animationGroups, function (name, elements)
        {
            self.eventHandler.stopTimer("anim-" + name);
        });

        this.playableAnimations = {};
        this.animationGroups = {};
        this.genericDrawActions = {};

    }

    public setPosition(elementName: string, x: number, y: number, rerender = true)
    {
        if (this.playableAnimations[elementName] !== undefined)
        {
            this.playableAnimations[elementName].X = x;
            this.playableAnimations[elementName].Y = y;

            if (rerender)
            {
                this.eventHandler.callEvent("forceRerender", this, null);
            }
        }
    }

    private tileUpdate(tile: Tile)
    {
        var dynamic: boolean = false;

        var def: ElementDefinition = null;
        var defLayer: number = null;

        //this.gameHandler.log("Got Tile to update: (X: " + tile.XCoord + ", Y: " + tile.YCoord +") ", tile);

        if ((tile.BottomElement !== undefined) && (tile.BottomElement.Dynamic !== undefined) && (tile.BottomElement.Dynamic === true))
        {
            dynamic = true;
            def = tile.BottomElement;
            defLayer = 0;
        }
        if ((tile.MiddleElement !== undefined) && (tile.MiddleElement.Dynamic !== undefined) && (tile.MiddleElement.Dynamic === true))
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
        if ((tile.TopElement !== undefined) && (tile.TopElement.Dynamic !== undefined) && (tile.TopElement.Dynamic === true))
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
            if (def.Level === this.layer)
            {
                if (this.gameHandler.config.verbose)
                {
                    this.gameHandler.log("Load Animation for item: ", tile);
                }

                var id = ((tile.ID === undefined) || (tile.ID === null) || (tile.ID === "")) ? "ent-" + def.ID + "-" + Math.random() + "-" + Math.random() : "ent-" + tile.ID;

                tile.Animation = this.addAnimation(id, def.AnimationContainer, def.DefaultAnimation, tile.XCoord, tile.YCoord);

            }
            else if (this.gameHandler.config.verbose)
            {
                this.gameHandler.log("Ignore Dynamic Element .. not in the same layer ...");
            }
        }



    }


    public addAnimation(ElementID: string, containerName: string, startAnimation: string, x: number, y: number): PlayableAnimation
    {
        //this.gameHandler.log("Add Animation for: ", containerName, this.gameHandler.animations[containerName]);
        //this.gameHandler.log("Default Animation: ", startAnimation);
        //this.gameHandler.log({ "X": x, " Y": y });

        var container: InternalAnimationContainer = this.gameHandler.animations[containerName];
        if (container === undefined)
        {
            this.gameHandler.warn("Unknown Animation Cotainer: ", containerName, this.gameHandler.animations);

            return;
        }

        var animation: Animation = container.Animations[startAnimation];

        var element: PlayableAnimation =
            {
                ID: ElementID,
                AnimationContainer: container,
                X: x,
                Y: y,
                Animation: null,
                AnimationGroup: animation.AnimationGroup
            };

        this.playableAnimations[ElementID] = element;

        this.playAnimation(ElementID, startAnimation);

        return element;
    }

    public drawColorRect(name: string, x: number, y: number, width: number, height: number, red: number, green: number, blue: number, opacity: number = 1, rerender: boolean = true)
    {
        this.drawRect(name, x, y, width, height, "rgba(" + red + "," + green + "," + blue + "," + opacity + ")", rerender);
    }

    public writeText(name: string, text: string, x: number, y: number, font: string = "bold 12px sans-serif", textBaseline: string = "top", textAlign: string = "left", fillStyle: string = "rgba(0,0,0,1)", maxWidth?: number, rerender: boolean = true)
    {
        var self = this;

        this.genericDrawActions[name] =
        {
            Type: "Text",
            Action: function ()
            {
                self.ctx.font = font;
                self.ctx.textBaseline = textBaseline;
                self.ctx.textAlign = textAlign;
                self.ctx.fillStyle = fillStyle;
                if (maxWidth !== undefined)
                {
                    self.ctx.fillText(text, x, y, maxWidth);
                }
                else
                {
                    self.ctx.fillText(text, x, y);
                }
            }
        };

        if (rerender)
        {
            this.eventHandler.callEvent("forceRerender", this, null);
        }

    }

    public drawRect(name: string, x: number, y: number, width: number, height: number, fillStyle: string = "rgba(225,225,225,1)", rerender: boolean = true)
    {
        var self = this;
        this.genericDrawActions[name] =
        {
            Type: "Rectangle",
            Action: function ()
            {
                self.ctx.fillStyle = fillStyle;
                self.ctx.fillRect(x, y, width, height);
            }
        };

        if (rerender)
        {
            this.eventHandler.callEvent("forceRerender", this, null);
        }
    }

    public removeGenericDraw(name: string)
    {
        if (this.genericDrawActions[name] !== undefined)
        {
            delete this.genericDrawActions[name];

            this.eventHandler.callEvent("forceRerender", this, null);
        }
    }


    private getNewAnimationInstance(input: Animation): Animation
    {
        return <Animation>jQuery.extend(true, {}, input);
    }

    public playAnimation(elementID: string, animation: string, group?: string)
    {
        var container: PlayableAnimation = this.playableAnimations[elementID];

        if (container === undefined)
        {
            console.error("Can't play Animation: No Animation Container for element '" + elementID + "' can be found!");
        }

        if ((container.Animation !== null) && (container.Animation.ID === animation))
        {
            // this.gameHandler.warn("Animation '" + animation + "' is allready running for '" + elementID + "'");
            return;
        }


        this.stopAnimation(elementID);

        var newAnimation = this.getNewAnimationInstance(container.AnimationContainer.Animations[animation]);
        container.Animation = newAnimation;

        if ((group === undefined) || (group === null) || (group === ""))
        {
            if ((container.AnimationGroup !== undefined) && (container.AnimationGroup !== null) && (container.AnimationGroup !== ""))
            {
                group = container.AnimationGroup;
            }
            else if ((newAnimation.AnimationGroup !== undefined) && (newAnimation.AnimationGroup !== null) && (newAnimation.AnimationGroup !== ""))
            {
                group = newAnimation.AnimationGroup;
            }
            else
            {
                do
                {
                    group = "group-" + elementID + "-" + Math.random();
                }
                while (this.animationGroups[group] !== undefined);
            }

        }

        var timerName = (this.useAnimationGroups) ? ("anim-" + group) : this.staticName;
        if (!this.useAnimationGroups)
        {
            group = this.staticName;
        }

        //this.gameHandler.log(timerName);
        //this.gameHandler.log(container);


        if (this.gameHandler.config.verbose)
        {
            this.gameHandler.log("Animation Group: ", group);
        }

        if ((newAnimation.ImageCount > 0) && (newAnimation.Speed > 0))
        {
            var self = this;

            if (this.animationGroups[group] === undefined)
            {
                if (this.gameHandler.config.verbose)
                {
                    this.gameHandler.log("Dynamic Animation. Start timer: ", timerName);
                }

                this.animationGroups[group] = {};


                this.eventHandler.addTimer(timerName, function ()
                {
                    // If the Animation Group is unknown, don't render
                    if (typeof self.animationGroups[group] === "undefined")
                    {
                        if (self.gameHandler.config.verbose)
                        {
                            self.gameHandler.log("Unknown Animation Group. Abort Render. ", group);
                        }
                        self.eventHandler.stopTimer(timerName);

                        return;
                    }

                    var animinations: PlayableAnimation[] = [];
                    $.each(self.animationGroups[group], function (name, _)
                    {
                        animinations.push(self.playableAnimations[name]);
                    });

                    self.animationStep(group, animinations);

                    self.eventHandler.callEvent("forceRerender", self, null);


                }, newAnimation.Speed);

            }

            container.AnimationGroup = group;

            this.animationGroups[group][elementID] = true;

            /*
            this.animationGroups[group][elementID] = function ()
            {
                self.animationStep(group, container);
            };
            */

        }
        else
        {
            container.AnimationGroup = null;

            if (this.gameHandler.config.verbose)
            {
                this.gameHandler.log("Satic Animation applied ....");
            }
        }

        this.eventHandler.callEvent("forceRerender", this, null);

    }

    public stopAnimation(elementID: string)
    {
        if (this.useAnimationGroups)
        {

            var container: PlayableAnimation = this.playableAnimations[elementID];

            if (container.Animation == null)
            {
                return;
            }

            // Remove from Animation Group:
            if (container.AnimationGroup != null)
            {
                delete this.animationGroups[container.AnimationGroup][container.ID];

                if (this.animationGroups[container.AnimationGroup] !== undefined)
                {

                    // Check if ammount of Animations in that Group:
                    var count = 0;

                    $.each(this.animationGroups[container.AnimationGroup], function (k, _)
                    {
                        count++;
                    });

                    if (count === 0)
                    {
                        if (this.gameHandler.config.verbose)
                        {
                            this.gameHandler.log("Close Animation Group - Empty", group);
                        }

                        // Remove Timer for Animation:
                        var timerName = "anim-" + group;
                        this.eventHandler.stopTimer(timerName);
                    }
                }
            }

            container.AnimationGroup = null;
            container.Animation = null;
        }
        else
        {
            var staticTimerName = this.staticName;
            var group = this.staticName;

            this.eventHandler.stopTimer(staticTimerName);
            var staticContainer: PlayableAnimation = this.playableAnimations[elementID];

            staticContainer.Animation = null;

            this.animationGroups[group] = undefined;

        }

    }

    private animationStep(group: string, animation: PlayableAnimation[])
    {
        if (animation === null)
        {
            return;
        }

        if (animation.length === 0)
        {
            // I am a Empty Animation Group ... I should not be running!
            if (this.gameHandler.config.verbose)
            {
                this.gameHandler.log("Close Animation Group - AnimationStep is Empty", group);
            }


            var timerName = "anim-" + group;
            this.eventHandler.stopTimer(timerName);

            return;
        }

        //var anim: Animation = animation[0].Animation;

        var anims: Animation[] = [];
        $.each(animation, function (i, el)
        {
            anims.push(el.Animation);
        });


        if (anims.length === 0)
        {
            // I am a Empty Animation Group ... I should not be running!
            if (this.gameHandler.config.verbose)
            {
                this.gameHandler.log("Close Animation Group - AnimationStep is Empty", group);
            }

            this.eventHandler.stopTimer("anim-" + group);

            return;
        }

        if (group !== animation[0].AnimationGroup)
        {
            this.gameHandler.warn("Wrong Animation Group. Don't Update!", animation);

            if (this.gameHandler.config.verbose)
            {
                this.gameHandler.log("Close Animation Group - Wrong Animation Group", group);
            }



            this.eventHandler.stopTimer("anim-" + group);

            return;
        }

        var state: number = anims[0].AnimationState;

        state += (anims[0].IsReverse) ? -1 : 1;

        if ((state >= anims[0].ImageCount) || (state < 0))
        {
            // End of Animation reached:
            if (anims[0].Loop)
            {
                if (anims[0].ReverseOnEnd)
                {
                    if (anims[0].IsReverse)
                    {
                        $.each(anims, function (k, el)
                        {
                            el.AnimationState = 0;
                        });

                        //anim.AnimationState = 0;
                        anims[0].IsReverse = false;
                    }
                    else
                    {
                        $.each(anims, function (k, el)
                        {
                            el.AnimationState = anims[0].ImageCount - 1;
                        });


                        anims[0].IsReverse = true;
                    }
                }
                else
                {
                    if (anims[0].IsReverse)
                    {
                        $.each(anims, function (k, el)
                        {
                            el.AnimationState = anims[0].ImageCount - 1;
                        });

                    }
                    else
                    {
                        $.each(anims, function (k, el)
                        {
                            el.AnimationState = 0;
                        });

                    }
                }
            }
            else
            {
                $.each(anims, function (k, el)
                {
                    this.stopAnimation(el.ID);
                });
            }

        }
        else
        {
            $.each(anims, function (k, el)
            {
                el.AnimationState = state;
            });

        }


    }




    private getPosition(x: number, y: number): Coordinate
    {
        var tileSize: number = this.renderer.getTileSize();
        var result = {
            X: ((x - 1) * tileSize),
            Y: ((y - 1) * tileSize)
        };

        return result;
    }


    private renderAnimations(self: AnimationHandler)
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
            var pos: Coordinate = self.getPosition(el.X, el.Y);
            self.renderAninmation(el.AnimationContainer, el.Animation, pos.X, pos.Y);
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
            if (this.gameHandler.config.verbose)
            {
                console.warn("No sprite with name '" + name + "' was found!");
            }
            return;
        }

        this.ctx.drawImage(this.gameHandler.spriteContainer[name], offsetX, offsetY, width, height, canvasOffsetX, canvasOffsetY, canvasImageWidth, canvasImageHeight);
    }


    public test()
    {
        this.gameHandler.loadAnimation("data/animations/mew.json", () =>
        {


            var pos = this.gameHandler.playerManager.getPosition();

            this.addAnimation("test", "mew", "stand", pos.X, pos.Y + 2);
        });

    }

}

