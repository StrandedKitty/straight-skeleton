import PathQueue from "./PathQueue";

export default class PathQueueNode<T extends PathQueueNode<T>> {
	public List: PathQueue<T> = null;
	public Next: PathQueueNode<T> = null;
	public Previous: PathQueueNode<T> = null;

	public get IsEnd(): boolean {
		return this.Next === null || this.Previous === null;
	}

	public AddPush(node: PathQueueNode<T>) {
		this.List.AddPush(this, node);
	}

	public AddQueue(queue: PathQueueNode<T>): PathQueueNode<T> {
		if (this.List === queue.List)
			return null;

		let currentQueue: PathQueueNode<T> = this;

		let current = queue;

		while (current !== null) {
			const next = current.Pop();

			currentQueue.AddPush(current);
			currentQueue = current;

			current = next;
		}

		return currentQueue;
	}

	public FindEnd(): PathQueueNode<T> {
		if (this.IsEnd)
			return this;

		let current: PathQueueNode<T> = this;

		while (current.Previous !== null)
			current = current.Previous;

		return current;
	}

	public Pop(): PathQueueNode<T> {
		return this.List.Pop(this);
	}
}