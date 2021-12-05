import SkeletonEvent from "./SkeletonEvent";
import Edge from "../Circular/Edge";
import Vertex from "../Circular/Vertex";
import Vector2d from "../Primitives/Vector2d";

export default class SplitEvent extends SkeletonEvent {
	public readonly OppositeEdge: Edge = null;
	public readonly Parent: Vertex = null;

	constructor(point: Vector2d, distance: number, parent: Vertex, oppositeEdge: Edge) {
		super(point, distance);

		this.Parent = parent;
		this.OppositeEdge = oppositeEdge;
	}

	public override get IsObsolete(): boolean {
		return this.Parent.IsProcessed;
	}


	public override ToString(): string {
		return "SplitEvent [V=" + this.V + ", Parent=" + (this.Parent !== null ? this.Parent.Point.ToString() : "null") +
			", Distance=" + this.Distance + "]";
	}
}