import {ICircularList} from "./CircularList";

export default class CircularNode {
	public List: ICircularList = null;
	public Next: CircularNode = null;
	public Previous: CircularNode = null;

	public AddNext(node: CircularNode) {
		this.List.AddNext(this, node);
	}

	public AddPrevious(node: CircularNode) {
		this.List.AddPrevious(this, node);
	}

	public Remove() {
		this.List.Remove(this);
	}
}