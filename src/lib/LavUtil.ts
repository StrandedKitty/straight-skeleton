import Vertex from "./Circular/Vertex";
import {List} from "./Utils";
import CircularList from "./Circular/CircularList";

export default class LavUtil {
	public static IsSameLav(v1: Vertex, v2: Vertex): boolean {
		if (v1.List === null || v2.List === null)
			return false;
		return v1.List === v2.List;
	}

	public static RemoveFromLav(vertex: Vertex) {
		if (vertex === null || vertex.List === null)
			return;
		vertex.Remove();
	}

	public static CutLavPart(startVertex: Vertex, endVertex: Vertex): List<Vertex> {
		const ret = new List<Vertex>();
		const size = startVertex.List.Size;
		let next = startVertex;

		for (let i = 0; i < size; i++) {
			const current = next;
			next = current.Next as Vertex;
			current.Remove();
			ret.Add(current);

			if (current === endVertex)
				return ret;
		}

		throw new Error("End vertex can't be found in start vertex lav");
	}

	public static MergeBeforeBaseVertex(base: Vertex, merged: Vertex) {
		const size = merged.List.Size;

		for (let i = 0; i < size; i++) {
			const nextMerged = merged.Next as Vertex;
			nextMerged.Remove();

			base.AddPrevious(nextMerged);
		}
	}

	public static MoveAllVertexToLavEnd(vertex: Vertex, newLaw: CircularList<Vertex>) {
		const size = vertex.List.Size;
		for (let i = 0; i < size; i++) {
			const ver = vertex;
			vertex = vertex.Next as Vertex;
			ver.Remove();
			newLaw.AddLast(ver);
		}
	}
}