import SkeletonEvent from "./SkeletonEvent";
import {List} from "../Utils";
import IChain from "./Chains/IChain";
import Vector2d from "../Primitives/Vector2d";

export default class MultiSplitEvent extends SkeletonEvent {
	public readonly Chains: List<IChain>;

	public override get IsObsolete(): boolean {
		return false;
	}

	constructor(point: Vector2d, distance: number, chains: List<IChain>) {
		super(point, distance);

		this.Chains = chains;
	}
}