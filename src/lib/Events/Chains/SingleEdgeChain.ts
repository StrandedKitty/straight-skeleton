import IChain from "./IChain";
import Edge from "../../Circular/Edge";
import Vertex from "../../Circular/Vertex";
import ChainType from "./ChainType";

export default class SingleEdgeChain implements IChain {
	private readonly _nextVertex: Vertex;
	private readonly _oppositeEdge: Edge;
	private readonly _previousVertex: Vertex;

	constructor(oppositeEdge: Edge, nextVertex: Vertex) {
		this._oppositeEdge = oppositeEdge;
		this._nextVertex = nextVertex;
		this._previousVertex = nextVertex.Previous as Vertex;
	}

	public get PreviousEdge(): Edge {
		return this._oppositeEdge;
	}

	public get NextEdge(): Edge {
		return this._oppositeEdge;
	}

	public get PreviousVertex(): Vertex {
		return this._previousVertex;
	}

	public get NextVertex(): Vertex {
		return this._nextVertex;
	}

	public get CurrentVertex(): Vertex {
		return null;
	}

	public get ChainType(): ChainType {
		return ChainType.Split;
	}
}