export default class Vector2d {
	public static Empty: Vector2d = new Vector2d(Number.MIN_VALUE, Number.MIN_VALUE);

	public X: number = 0;
	public Y: number = 0;

	constructor(x: number, y: number) {
		this.X = x;
		this.Y = y;
	}

	public Negate() {
		this.X = -this.X;
		this.Y = -this.Y;
	}

	public DistanceTo(var1: Vector2d): number {
		const var2 = this.X - var1.X;
		const var4 = this.Y - var1.Y;
		return Math.sqrt(var2 * var2 + var4 * var4);
	}

	public Normalized(): Vector2d {
		const var1 = 1 / Math.sqrt(this.X * this.X + this.Y * this.Y);
		return new Vector2d(this.X * var1, this.Y * var1);
	}

	public Dot(var1: Vector2d): number {
		return this.X * var1.X + this.Y * var1.Y;
	}

	public DistanceSquared(var1: Vector2d): number {
		const var2 = this.X - var1.X;
		const var4 = this.Y - var1.Y;
		return var2 * var2 + var4 * var4;
	}

	public Add(v: Vector2d): Vector2d {
		return new Vector2d(this.X + v.X, this.Y + v.Y);
	}

	public Sub(v: Vector2d): Vector2d {
		return new Vector2d(this.X - v.X, this.Y - v.Y);
	}

	public MultiplyScalar(scale: number): Vector2d {
		return new Vector2d(this.X * scale, this.Y * scale);
	}

	public Equals(v: Vector2d): boolean {
		return this.X === v.X && this.Y === v.Y;
	}

	public NotEquals(v: Vector2d): boolean {
		return !this.Equals(v);
	}

	public ToString(): string {
		return `${this.X}, ${this.Y}`;
	}
}