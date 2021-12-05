import PathQueue from "./PathQueue";
import {FaceNode} from "./FaceNode";
import PathQueueNode from "./PathQueueNode";
import Edge from "../Circular/Edge";

export default class FaceQueue extends PathQueue<FaceNode> {
	public Edge: Edge = null;
	public Closed: boolean = false;

	public get IsUnconnected(): boolean {
		return this.Edge === null;
	}

	public override AddPush(node: PathQueueNode<FaceNode>, newNode: PathQueueNode<FaceNode>) {
		if (this.Closed)
			throw new Error("Can't add node to closed FaceQueue");

		super.AddPush(node, newNode);
	}

	public Close() {
		this.Closed = true;
	}
}