import CircularNode from "./CircularNode";

export interface ICircularList {
	readonly Size: number;

	AddNext(node: CircularNode, newNode: CircularNode): void;

	AddPrevious(node: CircularNode, newNode: CircularNode): void;

	AddLast(node: CircularNode): void;

	Remove(node: CircularNode): void;
}

export default class CircularList<T extends CircularNode> implements ICircularList {
	private _first: T = null;
	private _size: number = 0;

	public AddNext(node: CircularNode, newNode: CircularNode) {
		if (newNode.List !== null)
			throw new Error("Node is already assigned to different list!");

		newNode.List = this;

		newNode.Previous = node;
		newNode.Next = node.Next;

		node.Next.Previous = newNode;
		node.Next = newNode;

		this._size++;
	}

	AddPrevious(node: CircularNode, newNode: CircularNode) {
		if (newNode.List !== null)
			throw new Error("Node is already assigned to different list!");

		newNode.List = this;

		newNode.Previous = node.Previous;
		newNode.Next = node;

		node.Previous.Next = newNode;
		node.Previous = newNode;

		this._size++;
	}

	AddLast(node: CircularNode) {
		if (node.List !== null)
			throw new Error("Node is already assigned to different list!");

		if (this._first === null) {
			this._first = node as T;

			node.List = this;
			node.Next = node;
			node.Previous = node;

			this._size++;
		} else
			this.AddPrevious(this._first, node);
	}

	Remove(node: CircularNode) {
		if (node.List !== this)
			throw new Error("Node is not assigned to this list!");

		if (this._size <= 0)
			throw new Error("List is empty can't remove!");

		node.List = null;

		if (this._size === 1)
			this._first = null;

		else {
			if (this._first === node)
				this._first = <T>this._first.Next;

			node.Previous.Next = node.Next;
			node.Next.Previous = node.Previous;
		}

		node.Previous = null;
		node.Next = null;

		this._size--;
	}

	public get Size(): number {
		return this._size;
	}

	public First(): T {
		return this._first;
	}

	public* Iterate(): Generator<T> {
		let current = this._first;
		let i = 0;

		while (current !== null) {
			yield current;

			if (++i === this.Size) {
				return;
			}

			current = <T>current.Next;
		}
	}
}