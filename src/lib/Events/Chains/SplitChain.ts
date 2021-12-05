import IChain from "./IChain";
import Edge from "../../Circular/Edge";
import Vertex from "../../Circular/Vertex";
import ChainType from "./ChainType";
import VertexSplitEvent from "../VertexSplitEvent";
import SplitEvent from "../SplitEvent";

export default class SplitChain implements IChain {
	private readonly _splitEvent: SplitEvent;

	constructor(event: SplitEvent) {
		this._splitEvent = event;
	}

	public get OppositeEdge(): Edge {
		if (!(this._splitEvent instanceof VertexSplitEvent))
			return this._splitEvent.OppositeEdge;

		return null;
	}

	public get PreviousEdge(): Edge {
		return this._splitEvent.Parent.PreviousEdge;
	}

	public get NextEdge(): Edge {
		return this._splitEvent.Parent.NextEdge;
	}

	public get PreviousVertex(): Vertex {
		return this._splitEvent.Parent.Previous as Vertex;
	}

	public get NextVertex(): Vertex {
		return this._splitEvent.Parent.Next as Vertex;
	}

	public get CurrentVertex(): Vertex {
		return this._splitEvent.Parent;
	}

	public get ChainType(): ChainType {
		return ChainType.Split;
	}
}