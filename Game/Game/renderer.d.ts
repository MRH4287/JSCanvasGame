interface Renderer
{
    test(offset: number): void;

    getAnimationLayer(): RendererLayer;
    getPlayerLayer(): RendererLayer;
    clearRenderContext(ctx: CanvasRenderingContext2D): void;
}

interface RendererLayer
{
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
}
