import CircularNode from "./CircularNode";
import Vector2d from "../Primitives/Vector2d";
import LineParametric2d from "../Primitives/LineParametric2d";
import Edge from "./Edge";
import {FaceNode} from "../Path/FaceNode";

export default class Vertex extends CircularNode {
	readonly RoundDigitCount = 5;

	public Point: Vector2d = null;
	public readonly Distance: number;
	public readonly Bisector: LineParametric2d = null;

	public readonly NextEdge: Edge = null;
	public readonly PreviousEdge: Edge = null;

	public LeftFace: FaceNode = null;
	public RightFace: FaceNode = null;

	public IsProcessed: boolean;

	constructor(point: Vector2d, distance: number, bisector: LineParametric2d, previousEdge: Edge, nextEdge: Edge) {
		super();

		this.Point = point;
		this.Distance = +distance.toFixed(this.RoundDigitCount);
		this.Bisector = bisector;
		this.PreviousEdge = previousEdge;
		this.NextEdge = nextEdge;

		this.IsProcessed = false;
	}

	public ToString(): string {
		return "Vertex [v=" + this.Point + ", IsProcessed=" + this.IsProcessed +
			", Bisector=" + this.Bisector + ", PreviousEdge=" + this.PreviousEdge +
			", NextEdge=" + this.NextEdge;
	}
}