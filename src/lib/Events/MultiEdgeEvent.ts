import SkeletonEvent from "./SkeletonEvent";
import Vector2d from "../Primitives/Vector2d";
import EdgeChain from "./Chains/EdgeChain";

export default class MultiEdgeEvent extends SkeletonEvent {
	public readonly Chain: EdgeChain;

	public override get IsObsolete(): boolean {
		return false;
	}

	constructor(point: Vector2d, distance: number, chain: EdgeChain) {
		super(point, distance);

		this.Chain = chain;
	}
}