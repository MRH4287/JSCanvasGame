interface GraphStatic
{
    new(input:boolean[][]): GraphInstance;
}

interface GraphInstance
{
    grid: GridNode[][];

}

declare var Graph: GraphStatic;

interface GridNode
{
    closed: boolean;
    f: number;
    g: number;
    h: number;
    parent: GridNode;
    visited: boolean;
    weight: boolean;
    x: number;
    y: number;
}


interface AstarInstance
{
    search(graph: GraphInstance, start: GridNode, end: GridNode): GridNode[];
}

declare var astar: AstarInstance;
