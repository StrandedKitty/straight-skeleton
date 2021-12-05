import Edge from "./Circular/Edge";
import Vector2d from "./Primitives/Vector2d";
import {List} from "./Utils";

export default class EdgeResult {
	public readonly Edge: Edge;
	public readonly Polygon: List<Vector2d>;

	constructor(edge: Edge, polygon: List<Vector2d>) {
		this.Edge = edge;
		this.Polygon = polygon;
	}
}