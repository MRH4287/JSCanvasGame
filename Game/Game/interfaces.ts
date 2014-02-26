interface Renderer
{
    test(offset: number): void;

    getAnimationLayer(): RendererLayer;
    getPlayerLayer(): RendererLayer;
    clearRenderContext(ctx: CanvasRenderingContext2D): void;
    getTileSize(): number;
    setMap(map: Tile[][]);
    initMap(sizeX: number, sizeY: number);
    setConfig( elements: {[id: string]: ElementDefinition } );
}

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

interface EventData
{
    callbacks:
    {
        (sender: any, arguments: any): void;
    }[]
}

