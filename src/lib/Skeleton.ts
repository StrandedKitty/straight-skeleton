import Vector2d from "./Primitives/Vector2d";
import EdgeResult from "./EdgeResult";
import {Dictionary, List} from "./Utils";

export class Skeleton {
	public readonly Edges: List<EdgeResult> = null;
	public readonly Distances: Dictionary<Vector2d, number> = null;

	constructor(edges: List<EdgeResult>, distances: Dictionary<Vector2d, number>) {
		this.Edges = edges;
		this.Distances = distances;
	}
}