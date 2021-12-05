import IChain from "./IChain";
import EdgeEvent from "../EdgeEvent";
import {List} from "../../Utils";
import Edge from "../../Circular/Edge";
import Vertex from "../../Circular/Vertex";
import ChainType from "./ChainType";

export default class EdgeChain implements IChain {
	private readonly _closed: boolean;
	public EdgeList: List<EdgeEvent>;

	constructor(edgeList: List<EdgeEvent>) {
		this.EdgeList = edgeList;
		this._closed = this.PreviousVertex === this.NextVertex;
	}

	public get PreviousEdge(): Edge {
		return this.EdgeList[0].PreviousVertex.PreviousEdge;
	}

	public get NextEdge(): Edge {
		return this.EdgeList[this.EdgeList.Count - 1].NextVertex.NextEdge;
	}

	public get PreviousVertex(): Vertex {
		return this.EdgeList[0].PreviousVertex;
	}

	public get NextVertex(): Vertex {
		return this.EdgeList[this.EdgeList.Count - 1].NextVertex;
	}

	public get CurrentVertex(): Vertex {
		return null;
	}

	public get ChainType(): ChainType {
		return this._closed ? ChainType.ClosedEdge : ChainType.Edge;
	}
}