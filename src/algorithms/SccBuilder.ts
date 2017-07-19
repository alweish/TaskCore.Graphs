import {List} from "immutable";
import {IGraph} from "../main/IGraph";
import {IVertex} from "../main/IVertex";
import {DirectedGraph} from "../main/DirectedGraph";
import {UndirectedGraph} from "../main/UndirectedGraph";
export class SccBuilder {
    /**
     *  Ищет компоненты связности для заданного графа
     */
    public static findComponents(graph: IGraph): IGraph[] {
        return (new SccBuilder(graph)).buildComponents();
    }

    private readonly _accessibilityMatrix: number[][];
    private readonly _graph: IGraph;
    private readonly _vertices: List<IVertex>;

    private constructor(graph: IGraph) {
        this._graph = graph;
        this._vertices = this._graph.vertices;
        this._accessibilityMatrix = new [this._graph.verticesNumber, this._graph.verticesNumber];
    }

    private  buildAccessibilityMatrix(startIndex: number, currentIndex: number): void {
        const currentVertex: IVertex = this._vertices[currentIndex];

        for (let i: number = 0; i < this._graph.verticesNumber; i++)
        {
            if (i == startIndex ||
                this._graph[currentVertex][this._vertices[i]] == null ||
                this._accessibilityMatrix[startIndex][i] != 0)
            {
                continue;
            }

            this._accessibilityMatrix[startIndex][i] = 1;
            this.buildAccessibilityMatrix(startIndex, i);
        }
    }

    //TODO: кажется, тут местами можно немного проще сделать
    private buildComponents(): IGraph[] {
        for (let i: number = 0; i < this._graph.verticesNumber; i++)
        {
            this.buildAccessibilityMatrix(i, i);
        }

        const s: number[][] = new [this._graph.verticesNumber, this._graph.verticesNumber];


        for (let i: number = 0; i < this._graph.verticesNumber; i++)
        {
            for (let j: number = 0; j < this._graph.verticesNumber; ++j)
            {
                s[i][j] = this._accessibilityMatrix[i][j] * this._accessibilityMatrix[j][i];
            }
        }

        const added: boolean[] = new [this._graph.verticesNumber];
        for (let i: number = 0; i < added.length; i++)
        {
            added[i] = false;
        }

        const components: IGraph[] = new IGraph[];
        for (let i: number = 0; i < this._graph.verticesNumber; i++)
        {
            if (added[i])
                continue;
            const scc: IGraph = this._graph.isDirected
                ? new DirectedGraph()
                : new UndirectedGraph();

            added[i] = true;
            scc.addVertex(this._vertices[i]);
            for (let j: number = 0; j < this._graph.verticesNumber; j++)
            {
                if (!added[j] && s[i][j] == 1)
                {
                    added[j] = true;
                    scc.addVertex(this._vertices[j]);
                }
            }
            components.push(scc);
        }
        this._graph.edges.forEach(edge => {
            const whereToAdd =
                components.filter(c => c.vertices.indexOf(edge.vertexOne) != NaN && c.vertices.indexOf(edge.vertexTwo)) != NaN;
            whereToAdd.forEach(c => c.addEdge(edge));
        };
        return components;
    }
}