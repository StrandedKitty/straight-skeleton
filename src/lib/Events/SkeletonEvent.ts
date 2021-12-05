import Vector2d from "../Primitives/Vector2d";

export default abstract class SkeletonEvent {
	public V: Vector2d = null;

	public Distance: number;

	public abstract get IsObsolete(): boolean;

	protected constructor(point: Vector2d, distance: number) {
		this.V = point;
		this.Distance = distance;
	}

	public ToString(): string {
		return "IntersectEntry [V=" + this.V + ", Distance=" + this.Distance + "]";
	}

	public GetType(): string {
		return this.constructor.name;
	}
}