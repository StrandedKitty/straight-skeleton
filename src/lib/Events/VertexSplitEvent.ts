import SplitEvent from "./SplitEvent";
import Vector2d from "../Primitives/Vector2d";
import Vertex from "../Circular/Vertex";

export default class VertexSplitEvent extends SplitEvent {
	constructor(point: Vector2d, distance: number, parent: Vertex) {
		super(point, distance, parent, null);
	}

	public override ToString(): string {
		return "VertexSplitEvent [V=" + this.V + ", Parent=" +
			(this.Parent !== null ? this.Parent.Point.ToString() : "null")
			+ ", Distance=" + this.Distance + "]";
	}
}