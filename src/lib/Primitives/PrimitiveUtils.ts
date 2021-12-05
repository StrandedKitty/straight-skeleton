import Vector2d from "./Vector2d";
import LineParametric2d from "./LineParametric2d";
import {List} from "../Utils";

class IntersectPoints {
	public readonly Intersect: Vector2d = null;
	public readonly IntersectEnd: Vector2d = null;

	constructor(intersect?: Vector2d, intersectEnd?: Vector2d) {
		if (!intersect) {
			intersect = Vector2d.Empty;
		}

		if (!intersectEnd) {
			intersectEnd = Vector2d.Empty;
		}

		this.Intersect = intersect;
		this.IntersectEnd = intersectEnd;
	}
}


export default class PrimitiveUtils {
	public static FromTo(begin: Vector2d, end: Vector2d): Vector2d {
		return new Vector2d(end.X - begin.X, end.Y - begin.Y);
	}

	public static OrthogonalLeft(v: Vector2d): Vector2d {
		return new Vector2d(-v.Y, v.X);
	}

	public static OrthogonalRight(v: Vector2d): Vector2d {
		return new Vector2d(v.Y, -v.X);
	}

	public static OrthogonalProjection(unitVector: Vector2d, vectorToProject: Vector2d): Vector2d {
		const n = new Vector2d(unitVector.X, unitVector.Y).Normalized();

		const px = vectorToProject.X;
		const py = vectorToProject.Y;

		const ax = n.X;
		const ay = n.Y;

		return new Vector2d(px * ax * ax + py * ax * ay, px * ax * ay + py * ay * ay);
	}

	public static BisectorNormalized(norm1: Vector2d, norm2: Vector2d): Vector2d {
		const e1v = PrimitiveUtils.OrthogonalLeft(norm1);
		const e2v = PrimitiveUtils.OrthogonalLeft(norm2);

		if (norm1.Dot(norm2) > 0)
			return e1v.Add(e2v);

		let ret = new Vector2d(norm1.X, norm1.Y);
		ret.Negate();
		ret = ret.Add(norm2);

		if (e1v.Dot(norm2) < 0)
			ret.Negate();

		return ret;
	}

	private static readonly SmallNum = 0.00000001;

	private static readonly Empty: IntersectPoints = new IntersectPoints();

	public static IsPointOnRay(point: Vector2d, ray: LineParametric2d, epsilon: number): boolean {
		const rayDirection = new Vector2d(ray.U.X, ray.U.Y).Normalized();

		const pointVector = point.Sub(ray.A);

		let dot = rayDirection.Dot(pointVector);

		if (dot < epsilon)
			return false;

		const x = rayDirection.X;
		rayDirection.X = rayDirection.Y;
		rayDirection.Y = -x;

		dot = rayDirection.Dot(pointVector);

		return -epsilon < dot && dot < epsilon;
	}

	public static IntersectRays2D(r1: LineParametric2d, r2: LineParametric2d): IntersectPoints {
		const s1p0 = r1.A;
		const s1p1 = r1.A.Add(r1.U);

		const s2p0 = r2.A;

		const u = r1.U;
		const v = r2.U;

		const w = s1p0.Sub(s2p0);
		const d = PrimitiveUtils.Perp(u, v);

		if (Math.abs(d) < PrimitiveUtils.SmallNum) {
			if (PrimitiveUtils.Perp(u, w) !== 0 || PrimitiveUtils.Perp(v, w) !== 0)
				return PrimitiveUtils.Empty;

			const du = PrimitiveUtils.Dot(u, u);
			const dv = PrimitiveUtils.Dot(v, v);

			if (du === 0 && dv === 0) {
				if (s1p0.NotEquals(s2p0))
					return PrimitiveUtils.Empty;

				return new IntersectPoints(s1p0);
			}
			if (du === 0) {
				if (!PrimitiveUtils.InCollinearRay(s1p0, s2p0, v))
					return PrimitiveUtils.Empty;

				return new IntersectPoints(s1p0);
			}
			if (dv === 0) {
				if (!PrimitiveUtils.InCollinearRay(s2p0, s1p0, u))
					return PrimitiveUtils.Empty;

				return new IntersectPoints(s2p0);
			}

			let t0, t1;
			var w2 = s1p1.Sub(s2p0);
			if (v.X !== 0) {
				t0 = w.X / v.X;
				t1 = w2.X / v.X;
			} else {
				t0 = w.Y / v.Y;
				t1 = w2.Y / v.Y;
			}
			if (t0 > t1) {
				const t = t0;
				t0 = t1;
				t1 = t;
			}
			if (t1 < 0)
				return PrimitiveUtils.Empty;

			t0 = t0 < 0 ? 0 : t0;

			if (t0 === t1) {
				let I0 = new Vector2d(v.X, v.Y);
				I0 = I0.MultiplyScalar(t0);
				I0 = I0.Add(s2p0);

				return new IntersectPoints(I0);
			}

			let I_0 = new Vector2d(v.X, v.Y);
			I_0 = I_0.MultiplyScalar(t0);
			I_0 = I_0.Add(s2p0);

			let I1 = new Vector2d(v.X, v.Y);
			I1 = I1.MultiplyScalar(t1);
			I1 = I1.Add(s2p0);

			return new IntersectPoints(I_0, I1);
		}

		const sI = PrimitiveUtils.Perp(v, w) / d;
		if (sI < 0 /* || sI > 1 */)
			return PrimitiveUtils.Empty;

		const tI = PrimitiveUtils.Perp(u, w) / d;
		if (tI < 0 /* || tI > 1 */)
			return PrimitiveUtils.Empty;

		let IO = new Vector2d(u.X, u.Y);
		IO = IO.MultiplyScalar(sI);
		IO = IO.Add(s1p0);

		return new IntersectPoints(IO);
	}

	private static InCollinearRay(p: Vector2d, rayStart: Vector2d, rayDirection: Vector2d): boolean {
		const collideVector = p.Sub(rayStart);
		const dot = rayDirection.Dot(collideVector);

		return !(dot < 0);
	}

	private static Dot(u: Vector2d, v: Vector2d): number {
		return u.Dot(v);
	}

	private static Perp(u: Vector2d, v: Vector2d): number {
		return u.X * v.Y - u.Y * v.X;
	}

	public static IsClockwisePolygon(polygon: List<Vector2d>): boolean {
		return PrimitiveUtils.Area(polygon) < 0;
	}

	private static Area(polygon: List<Vector2d>): number {
		const n = polygon.Count;
		let A = 0;
		for (let p = n - 1, q = 0; q < n; p = q++)
			A += polygon[p].X * polygon[q].Y - polygon[q].X * polygon[p].Y;

		return A * 0.5;
	}

	public static MakeCounterClockwise(polygon: List<Vector2d>): List<Vector2d> {
		if (PrimitiveUtils.IsClockwisePolygon(polygon))
			polygon.Reverse();

		return polygon;
	}

	public static IsPointInsidePolygon(point: Vector2d, points: List<Vector2d>): boolean {
		const numpoints = points.Count;

		if (numpoints < 3)
			return false;

		let it = 0;
		const first = points[it];
		let oddNodes = false;

		for (let i = 0; i < numpoints; i++) {
			const node1 = points[it];
			it++;
			const node2 = i === numpoints - 1 ? first : points[it];

			const x = point.X;
			const y = point.Y;

			if (node1.Y < y && node2.Y >= y || node2.Y < y && node1.Y >= y) {
				if (node1.X + (y - node1.Y) / (node2.Y - node1.Y) * (node2.X - node1.X) < x)
					oddNodes = !oddNodes;
			}
		}

		return oddNodes;
	}
}