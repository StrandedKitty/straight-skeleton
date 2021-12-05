import CircularNode from "./CircularNode";
import Vector2d from "../Primitives/Vector2d";
import LineLinear2d from "../Primitives/LineLinear2d";
import LineParametric2d from "../Primitives/LineParametric2d";

export default class Edge extends CircularNode {
	public readonly Begin: Vector2d;
	public readonly End: Vector2d;
	public readonly Norm: Vector2d;

	public readonly LineLinear2d: LineLinear2d;
	public BisectorNext: LineParametric2d = null;
	public BisectorPrevious: LineParametric2d = null;

	constructor(begin: Vector2d, end: Vector2d) {
		super();

		this.Begin = begin;
		this.End = end;

		this.LineLinear2d = new LineLinear2d(begin, end);
		this.Norm = end.Sub(begin).Normalized();
	}

	public ToString(): string {
		return `Edge [p1=${this.Begin}, p2=${this.End}]`;
	}
}