import PathQueueNode from "./PathQueueNode";

export default class PathQueue<T extends PathQueueNode<T>> {
	public Size: number = 0;
	public First: PathQueueNode<T> = null;

	public AddPush(node: PathQueueNode<T>, newNode: PathQueueNode<T>) {
		if (newNode.List !== null)
			throw new Error("Node is already assigned to different list!");

		if (node.Next !== null && node.Previous !== null)
			throw new Error("Can't push new node. Node is inside a Quere. " +
				"New node can by added only at the end of queue.");

		newNode.List = this;
		this.Size++;

		if (node.Next === null) {
			newNode.Previous = node;
			newNode.Next = null;

			node.Next = newNode;
		} else {
			newNode.Previous = null;
			newNode.Next = node;

			node.Previous = newNode;
		}
	}

	public AddFirst(node: T) {
		if (node.List !== null)
			throw new Error("Node is already assigned to different list!");

		if (this.First === null) {
			this.First = node;

			node.List = this;
			node.Next = null;
			node.Previous = null;

			this.Size++;
		} else
			throw new Error("First element already exist!");
	}

	public Pop(node: PathQueueNode<T>): PathQueueNode<T> {
		if (node.List !== this)
			throw new Error("Node is not assigned to this list!");

		if (this.Size <= 0)
			throw new Error("List is empty can't remove!");

		if (!node.IsEnd)
			throw new Error("Can pop only from end of queue!");

		node.List = null;

		let previous: PathQueueNode<T> = null;

		if (this.Size === 1)
			this.First = null;
		else {
			if (this.First === node) {
				if (node.Next !== null)
					this.First = node.Next;
				else if (node.Previous !== null)
					this.First = node.Previous;
				else
					throw new Error("Ups ?");
			}
			if (node.Next !== null) {
				node.Next.Previous = null;
				previous = node.Next;
			} else if (node.Previous !== null) {
				node.Previous.Next = null;
				previous = node.Previous;
			}
		}

		node.Previous = null;
		node.Next = null;

		this.Size--;

		return previous;
	}

	public* Iterate(): Generator<T> {
		let current: T = <T>(this.First !== null ? this.First.FindEnd() : null);
		let i = 0;

		while (current !== null)
		{
			yield current;

			if (++i === this.Size)
				return;

			current = <T>current.Next;
		}
	}
}