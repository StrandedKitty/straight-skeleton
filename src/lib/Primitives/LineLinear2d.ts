import Vector2d from "./Vector2d";

export default class LineLinear2d {
	public A: number;
	public B: number;
	public C: number;

	constructor(pP1: Vector2d = Vector2d.Empty, pP2: Vector2d = Vector2d.Empty) {
		this.A = pP1.Y - pP2.Y;
		this.B = pP2.X - pP1.X;
		this.C = pP1.X * pP2.Y - pP2.X * pP1.Y;
	}

	public SetFromCoefficients(a: number, b: number, c: number): LineLinear2d {
		this.A = a;
		this.B = b;
		this.C = c;

		return this;
	}

	public Collide(pLine: LineLinear2d): Vector2d {
		return LineLinear2d.Collide(this, pLine);
	}

	public static Collide(pLine1: LineLinear2d, pLine2: LineLinear2d): Vector2d {
		return LineLinear2d.CollideCoeff(pLine1.A, pLine1.B, pLine1.C, pLine2.A, pLine2.B, pLine2.C);
	}

	public static CollideCoeff(A1: number, B1: number, C1: number, A2: number, B2: number, C2: number): Vector2d {
		const WAB = A1 * B2 - A2 * B1;
		const WBC = B1 * C2 - B2 * C1;
		const WCA = C1 * A2 - C2 * A1;

		return WAB === 0 ? Vector2d.Empty : new Vector2d(WBC / WAB, WCA / WAB);
	}

	public Contains(point: Vector2d): boolean {
		return Math.abs((point.X * this.A + point.Y * this.B + this.C)) < Number.EPSILON;
	}
}