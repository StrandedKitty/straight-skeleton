import Vector2d from "./Vector2d";
import LineLinear2d from "./LineLinear2d";
import PrimitiveUtils from "./PrimitiveUtils";

export default class LineParametric2d {
	public static readonly Empty: LineParametric2d = new LineParametric2d(Vector2d.Empty, Vector2d.Empty);

	public A: Vector2d = null;
	public U: Vector2d = null;

	constructor(pA: Vector2d, pU: Vector2d) {
		this.A = pA;
		this.U = pU;
	}

	public CreateLinearForm(): LineLinear2d {
		const x = this.A.X;
		const y = this.A.Y;

		const B = -this.U.X;
		const A = this.U.Y;

		const C = -(A * x + B * y);

		return new LineLinear2d().SetFromCoefficients(A, B, C);
	}

	public static Collide(ray: LineParametric2d, line: LineLinear2d, epsilon: number): Vector2d {
		const collide = LineLinear2d.Collide(ray.CreateLinearForm(), line);
		if (collide.Equals(Vector2d.Empty)) {
			return Vector2d.Empty;
		}

		const collideVector = collide.Sub(ray.A);
		return ray.U.Dot(collideVector) < epsilon ? Vector2d.Empty : collide;
	}

	public IsOnLeftSite(point: Vector2d, epsilon: number): boolean {
		const direction = point.Sub(this.A);
		return PrimitiveUtils.OrthogonalRight(this.U).Dot(direction) < epsilon;
	}

	public IsOnRightSite(point: Vector2d, epsilon: number): boolean {
		const direction = point.Sub(this.A);
		return PrimitiveUtils.OrthogonalRight(this.U).Dot(direction) > -epsilon;
	}
}