import SkeletonEvent from "./SkeletonEvent";
import Vertex from "../Circular/Vertex";
import Vector2d from "../Primitives/Vector2d";

export default class EdgeEvent extends SkeletonEvent {
	public readonly NextVertex: Vertex;
	public readonly PreviousVertex: Vertex;

	public override get IsObsolete(): boolean {
		return this.PreviousVertex.IsProcessed || this.NextVertex.IsProcessed;
	}

	constructor(point: Vector2d, distance: number, previousVertex: Vertex, nextVertex: Vertex) {
		super(point, distance);

		this.PreviousVertex = previousVertex;
		this.NextVertex = nextVertex;
	}

	public override ToString(): string {
		return "EdgeEvent [V=" + this.V + ", PreviousVertex="
			+ (this.PreviousVertex !== null ? this.PreviousVertex.Point.ToString() : "null") +
			", NextVertex="
			+ (this.NextVertex !== null ? this.NextVertex.Point.ToString() : "null") + ", Distance=" +
			this.Distance + "]";
	}
}