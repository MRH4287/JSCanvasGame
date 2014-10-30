
/*
interface Renderer
{
    test(offset: number): void;

    getBottomAnimationLayer(): RendererLayer;
    getMiddleAnimationLayer(): RendererLayer;
    getTopAnimationLayer(): RendererLayer;
    getPlayerLayer(): RendererLayer;
    clearRenderContext(ctx: CanvasRenderingContext2D): void;
    getTileSize(): number;
    setMap(map: Tile[][], reset?:boolean);
    initMap(sizeX: number, sizeY: number);
    setConfig(elements: { [id: string]: ElementDefinition });
    setOffset(offset: Coordinate);
    getMapSize(): Coordinate;
}
*/

interface RendererLayer
{
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
}


interface ElementDefinition
{
    ID: string;
    Name: string;
    Passable: boolean;
    Level?: number;
    Speed?: number;
    Flags?: string[];
    ImageURI: string;
    Events?: {
        key: string;
        value: string;
    }[];
    Dynamic?: boolean;
    AnimationDefinition?: string;
    AnimationContainer?: string;
    DefaultAnimation?: string;
}

interface Tile
{
    ID?: string;
    BottomElementID?: string;
    MiddleElementID?: string;
    TopElementID?: string;
    Flags?: string[];
    Passable?: boolean;
    Speed?: number;
    Events?: {
        key: string;
        value: string;
    }[];
    BottomElement: ElementDefinition;
    MiddleElement: ElementDefinition;
    TopElement: ElementDefinition;
    Animation: PlayableAnimation;
    X: number;
    Y: number;
    XCoord: number;
    YCoord: number;
}

interface PlayableAnimation
{
    ID: string;
    AnimationContainer: InternalAnimationContainer;
    Animation: Animation;
    X: number;
    Y: number;
    AnimationGroup: string;
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
    // The Animation Group of that Element
    AnimationGroup: string;
}


interface AnimationContainer
{
    // The ID of the Animation Container
    ID: string;
    // The Path to the Spritesheet
    ImageURI: string;
    //The Animations of this Container
    Animations: Animation[];
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

interface NPCInformation
{
    // The ID of the NPC-Type
    ID: string;
    // The Name of the NPC-Type
    Name: string;
    // The AnimationContainer of this NPC-Type
    AnimationContainer: string;
    // The Default Animation for this NPC-Type
    DefaultAnimation: string;
    // The Movement Speed of this NPC
    Speed: number;
    // The Script for this NPC
    Script?: string;
}

interface EventData
{
    callbacks:
    {
        (sender: any, arguments: any): void;
    }[]
}

enum PlayerState
{
    Standing, Walking
}

enum WalkDirection
{
    Up, Down, Left, Right, None
}

interface NPCData
{
    ID: string;
    Position: Coordinate;
    Target: Coordinate;
    GUID: string;
    Speed: number;
    State: PlayerState;
    Direction: WalkDirection;
    DisplaySpeechBubbleTo: number;

}

class CoordinateHelper
{
    public static Add(a: Coordinate, b: Coordinate): Coordinate
    {
        var result: Coordinate =
            {
                X: (a.X + b.X),
                Y: (a.Y + b.Y)
            };

        return result;
    }

    public static AddX(a: Coordinate, x: number): Coordinate
    {
        return this.Add(a, { X: x, Y: 0 });
    }

    public static AddY(a: Coordinate, y: number): Coordinate
    {
        return this.Add(a, { X: 0, Y: y });
    }

    public static Subtract(a: Coordinate, b: Coordinate): Coordinate
    {
        var result: Coordinate =
            {
                X: (a.X - b.X),
                Y: (a.Y - b.Y)
            };

        return result;
    }

    public static Length(a: Coordinate): number
    {
        return Math.sqrt(Math.pow(a.X, 2) + Math.pow(a.Y, 2));
    }

    public static Normalize(a: Coordinate): Coordinate
    {
        var length = this.Length(a);

        if (length === 0)
        {
            return a;
        }

        return {
            X: a.X / length,
            Y: a.Y / length
        };
    }

    public static Multiply(a: Coordinate, b: number): Coordinate
    {
        return {
            X: a.X * b,
            Y: a.Y * b
        };
    }

}

interface Coordinate
{
    X: number;
    Y: number;
}
