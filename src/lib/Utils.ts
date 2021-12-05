function insertInArray<T>(array: Array<T>, index: number, item: T): Array<T> {
	const items = Array.prototype.slice.call(arguments, 2);

	return [].concat(array.slice(0, index), items, array.slice(index));
}

export interface IComparable<T> {
	CompareTo(other: T): number;
}

export interface IComparer<T> {
	Compare(a: T, b: T): number;
}

export type GeoJSONMultipolygon = [number, number][][][];

export class List<T> extends Array<T> {
	constructor(capacity = 0) {
		super();
	}

	public Add(item: T) {
		this.push(item);
	}

	public Insert(index: number, item: T) {
		const newArr = insertInArray(this, index, item);

		this.length = newArr.length;

		for(let i = 0; i < newArr.length; i++) {
			this[i] = newArr[i];
		}
	}

	public Reverse() {
		this.reverse();
	}

	public Clear() {
		this.length = 0;
	}

	get Count(): number {
		return this.length;
	}

	public Any(filter?: (item: T) => boolean): boolean {
		if (!filter) {
			filter = T => true;
		}

		for (const item of this) {
			if (filter(item)) {
				return true;
			}
		}

		return false;
	}

	public RemoveAt(index: number) {
		this.splice(index, 1);
	}

	public Remove(itemToRemove: T) {
		const newArr = this.filter(item => item !== itemToRemove);

		this.length = newArr.length;

		for(let i = 0; i < newArr.length; i++) {
			this[i] = newArr[i];
		}
	}

	public AddRange(list: List<T>) {
		for (const item of list) {
			this.Add(item);
		}
	}

	public Sort(comparer: IComparer<T>) {
		this.sort(comparer.Compare.bind(comparer));
	}
}

export class HashSet<T> implements Iterable<T> {
	private Set: Set<T>;

	constructor() {
		this.Set = new Set();
	}

	public Add(item: T) {
		this.Set.add(item);
	}

	public Remove(item: T) {
		this.Set.delete(item);
	}

	public RemoveWhere(filter: (item: T) => boolean) {
		for (const item of this.Set.values()) {
			if (filter(item)) {
				this.Set.delete(item);
			}
		}
	}

	public Contains(item: T): boolean {
		return this.Set.has(item);
	}

	public Clear() {
		this.Set.clear();
	}

	public* [Symbol.iterator](): Generator<T> {
		for (const item of this.Set.values()) {
			yield item;
		}
	}
}

export class Dictionary<T1, T2> extends Map<T1, T2> {
	public ContainsKey(key: T1): boolean {
		return this.has(key);
	}

	public Add(key: T1, value: T2) {
		return this.set(key, value);
	}
}