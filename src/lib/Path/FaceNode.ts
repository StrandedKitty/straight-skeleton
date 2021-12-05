import PathQueueNode from "./PathQueueNode";
import Vertex from "../Circular/Vertex";
import FaceQueue from "./FaceQueue";

export class FaceNode extends PathQueueNode<FaceNode> {
	public readonly Vertex: Vertex = null;

	constructor(vertex: Vertex) {
		super();
		this.Vertex = vertex;
	}

	public get FaceQueue(): FaceQueue {
		return <FaceQueue>this.List;
	}

	public get IsQueueUnconnected(): boolean {
		return this.FaceQueue.IsUnconnected;
	}

	public QueueClose() {
		this.FaceQueue.Close();
	}
}