import {IComparer, List} from "../Utils";

export default class PriorityQueue<T> {
	private readonly _comparer: IComparer<T> = null;
	private readonly _heap: List<T> = null;

	constructor(capacity: number, comparer: IComparer<T>) {
		this._heap = new List<T>(capacity);
		this._comparer = comparer;
	}

	public Clear() {
		this._heap.Clear();
	}

	public Add(item: T) {
		let n = this._heap.Count;
		this._heap.Add(item);
		while (n !== 0) {
			const p = Math.floor(n / 2);
			if (this._comparer.Compare(this._heap[n], (this._heap[p])) >= 0) break;
			const tmp: T = this._heap[n];
			this._heap[n] = this._heap[p];
			this._heap[p] = tmp;
			n = p;
		}
	}

	get Count(): number {
		return this._heap.Count;
	}

	get Empty(): boolean {
		return this._heap.Count === 0;
	}

	public Peek(): T {
		return !this._heap.Any() ? null : this._heap[0];
	}

	public Next(): T {
		const val: T = this._heap[0];
		const nMax = this._heap.Count - 1;
		this._heap[0] = this._heap[nMax];
		this._heap.RemoveAt(nMax);

		let p = 0;
		while (true) {
			let c = p * 2;
			if (c >= nMax) break;

			if (c + 1 < nMax && this._comparer.Compare(this._heap[c + 1], this._heap[c]) < 0) c++;

			if (this._comparer.Compare(this._heap[p], (this._heap[c])) <= 0) break;

			const tmp: T = this._heap[p];
			this._heap[p] = this._heap[c];
			this._heap[c] = tmp;
			p = c;
		}
		return val;
	}
}