import {Skeleton} from "./Skeleton";
import {HashSet, List, IComparer, Dictionary, GeoJSONMultipolygon} from "./Utils";
import Vector2d from "./Primitives/Vector2d";
import PriorityQueue from "./Primitives/PriorityQueue";
import Edge from "./Circular/Edge";
import Vertex from "./Circular/Vertex";
import CircularList from "./Circular/CircularList";
import FaceQueue from "./Path/FaceQueue";
import SkeletonEvent from "./Events/SkeletonEvent";
import FaceQueueUtil from "./Path/FaceQueueUtil";
import LavUtil from "./LavUtil";
import IChain from "./Events/Chains/IChain";
import PrimitiveUtils from "./Primitives/PrimitiveUtils";
import LineParametric2d from "./Primitives/LineParametric2d";
import {FaceNode} from "./Path/FaceNode";
import MultiEdgeEvent from "./Events/MultiEdgeEvent";
import EdgeEvent from "./Events/EdgeEvent";
import PickEvent from "./Events/PickEvent";
import MultiSplitEvent from "./Events/MultiSplitEvent";
import SingleEdgeChain from "./Events/Chains/SingleEdgeChain";
import SplitChain from "./Events/Chains/SplitChain";
import SplitEvent from "./Events/SplitEvent";
import VertexSplitEvent from "./Events/VertexSplitEvent";
import EdgeChain from "./Events/Chains/EdgeChain";
import LineLinear2d from "./Primitives/LineLinear2d";
import EdgeResult from "./EdgeResult";
import ChainType from "./Events/Chains/ChainType";

export default class SkeletonBuilder {
	private static readonly SplitEpsilon = 1e-10;

	public static BuildFromGeoJSON(multipolygon: GeoJSONMultipolygon): Skeleton {
		const allEdges: List<EdgeResult> = new List();
		const allDistances: Dictionary<Vector2d, number> = new Dictionary();

		for (const polygon of multipolygon) {
			if (polygon.length > 0) {
				const outer = this.ListFromCoordinatesArray(polygon[0]);
				const holes: List<List<Vector2d>> = new List();

				for (let i = 1; i < polygon.length; i++) {
					holes.Add(this.ListFromCoordinatesArray(polygon[i]));
				}

				const skeleton = this.Build(outer, holes);

				for (const edge of skeleton.Edges) {
					allEdges.Add(edge);
				}

				for (const [key, distance] of skeleton.Distances.entries()) {
					allDistances.Add(key, distance);
				}
			}
		}

		return new Skeleton(allEdges, allDistances);
	}

	private static ListFromCoordinatesArray(arr: [number, number][]): List<Vector2d> {
		const list: List<Vector2d> = new List();

		for (const [x, y] of arr) {
			list.Add(new Vector2d(x, y));
		}

		return list;
	}

	public static Build(polygon: List<Vector2d>, holes: List<List<Vector2d>> = null): Skeleton {
		polygon = this.InitPolygon(polygon);
		holes = this.MakeClockwise(holes);

		const queue = new PriorityQueue<SkeletonEvent>(3, new SkeletonEventDistanseComparer());
		const sLav = new HashSet<CircularList<Vertex>>();
		const faces = new List<FaceQueue>();
		const edges = new List<Edge>();

		this.InitSlav(polygon, sLav, edges, faces);

		if (holes !== null) {
			for (const inner of holes) {
				this.InitSlav(inner, sLav, edges, faces);
			}
		}

		this.InitEvents(sLav, queue, edges);

		let count = 0;
		while (!queue.Empty) {
			count = this.AssertMaxNumberOfInteraction(count);
			const levelHeight = queue.Peek().Distance;

			for (const event of this.LoadAndGroupLevelEvents(queue)) {
				if (event.IsObsolete)
					continue;

				if (event instanceof EdgeEvent)
					throw new Error("All edge@events should be converted to MultiEdgeEvents for given level");
				if (event instanceof SplitEvent)
					throw new Error("All split events should be converted to MultiSplitEvents for given level");
				if (event instanceof MultiSplitEvent)
					this.MultiSplitEvent(<MultiSplitEvent>event, sLav, queue, edges);
				else if (event instanceof PickEvent)
					this.PickEvent(<PickEvent>event);
				else if (event instanceof MultiEdgeEvent)
					this.MultiEdgeEvent(<MultiEdgeEvent>event, queue, edges);
				else
					throw new Error("Unknown event type: " + event.GetType());
			}

			this.ProcessTwoNodeLavs(sLav);
			this.RemoveEventsUnderHeight(queue, levelHeight);
			this.RemoveEmptyLav(sLav);
		}

		return this.AddFacesToOutput(faces);
	}

	private static InitPolygon(polygon: List<Vector2d>): List<Vector2d> {
		if (polygon === null)
			throw new Error("polygon can't be null");

		if (polygon[0].Equals(polygon[polygon.Count - 1]))
			throw new Error("polygon can't start and end with the same point");

		return this.MakeCounterClockwise(polygon);
	}

	private static ProcessTwoNodeLavs(sLav: HashSet<CircularList<Vertex>>) {
		for (const lav of sLav) {
			if (lav.Size === 2) {
				const first = lav.First();
				const last = first.Next as Vertex;

				FaceQueueUtil.ConnectQueues(first.LeftFace, last.RightFace);
				FaceQueueUtil.ConnectQueues(first.RightFace, last.LeftFace);

				first.IsProcessed = true;
				last.IsProcessed = true;

				LavUtil.RemoveFromLav(first);
				LavUtil.RemoveFromLav(last);
			}
		}
	}

	private static RemoveEmptyLav(sLav: HashSet<CircularList<Vertex>>) {
		sLav.RemoveWhere(circularList => circularList.Size === 0);
	}

	private static MultiEdgeEvent(event: MultiEdgeEvent, queue: PriorityQueue<SkeletonEvent>, edges: List<Edge>) {
		const center = event.V;
		const edgeList = event.Chain.EdgeList;

		const previousVertex = event.Chain.PreviousVertex;
		previousVertex.IsProcessed = true;

		const nextVertex = event.Chain.NextVertex;
		nextVertex.IsProcessed = true;

		const bisector = this.CalcBisector(center, previousVertex.PreviousEdge, nextVertex.NextEdge);
		const edgeVertex = new Vertex(center, event.Distance, bisector, previousVertex.PreviousEdge,
			nextVertex.NextEdge);

		this.AddFaceLeft(edgeVertex, previousVertex);

		this.AddFaceRight(edgeVertex, nextVertex);

		previousVertex.AddPrevious(edgeVertex);

		this.AddMultiBackFaces(edgeList, edgeVertex);

		this.ComputeEvents(edgeVertex, queue, edges);
	}

	private static AddMultiBackFaces(edgeList: List<EdgeEvent>, edgeVertex: Vertex) {
		for (const edgeEvent of edgeList) {
			const leftVertex = edgeEvent.PreviousVertex;
			leftVertex.IsProcessed = true;
			LavUtil.RemoveFromLav(leftVertex);

			const rightVertex = edgeEvent.NextVertex;
			rightVertex.IsProcessed = true;
			LavUtil.RemoveFromLav(rightVertex);

			this.AddFaceBack(edgeVertex, leftVertex, rightVertex);
		}
	}

	private static PickEvent(event: PickEvent) {
		const center = event.V;
		const edgeList = event.Chain.EdgeList;

		const vertex = new Vertex(center, event.Distance, LineParametric2d.Empty, null, null);
		vertex.IsProcessed = true;

		this.AddMultiBackFaces(edgeList, vertex);
	}

	private static MultiSplitEvent(event: MultiSplitEvent, sLav: HashSet<CircularList<Vertex>>, queue: PriorityQueue<SkeletonEvent>, edges: List<Edge>) {
		const chains = event.Chains;
		const center = event.V;

		this.CreateOppositeEdgeChains(sLav, chains, center);

		chains.Sort(new ChainComparer(center));

		let lastFaceNode: FaceNode = null;

		let edgeListSize = chains.Count;
		for (let i = 0; i < edgeListSize; i++) {
			const chainBegin = chains[i];
			const chainEnd = chains[(i + 1) % edgeListSize];

			const newVertex = this.CreateMultiSplitVertex(chainBegin.NextEdge, chainEnd.PreviousEdge, center, event.Distance);

			const beginNextVertex = chainBegin.NextVertex;
			const endPreviousVertex = chainEnd.PreviousVertex;

			this.CorrectBisectorDirection(newVertex.Bisector, beginNextVertex, endPreviousVertex, chainBegin.NextEdge, chainEnd.PreviousEdge);

			if (LavUtil.IsSameLav(beginNextVertex, endPreviousVertex)) {
				const lavPart = LavUtil.CutLavPart(beginNextVertex, endPreviousVertex);

				const lav = new CircularList<Vertex>();
				sLav.Add(lav);
				lav.AddLast(newVertex);
				for (const vertex of lavPart)
					lav.AddLast(vertex);
			} else {
				LavUtil.MergeBeforeBaseVertex(beginNextVertex, endPreviousVertex);
				endPreviousVertex.AddNext(newVertex);
			}

			this.ComputeEvents(newVertex, queue, edges);
			lastFaceNode = this.AddSplitFaces(lastFaceNode, chainBegin, chainEnd, newVertex);
		}

		edgeListSize = chains.Count;
		for (let i = 0; i < edgeListSize; i++) {
			const chainBegin = chains[i];
			const chainEnd = chains[(i + 1) % edgeListSize];

			LavUtil.RemoveFromLav(chainBegin.CurrentVertex);
			LavUtil.RemoveFromLav(chainEnd.CurrentVertex);

			if (chainBegin.CurrentVertex !== null)
				chainBegin.CurrentVertex.IsProcessed = true;
			if (chainEnd.CurrentVertex !== null)
				chainEnd.CurrentVertex.IsProcessed = true;
		}
	}

	private static CorrectBisectorDirection(bisector: LineParametric2d, beginNextVertex: Vertex, endPreviousVertex: Vertex, beginEdge: Edge, endEdge: Edge) {
		const beginEdge2 = beginNextVertex.PreviousEdge;
		const endEdge2 = endPreviousVertex.NextEdge;

		if (beginEdge !== beginEdge2 || endEdge !== endEdge2)
			throw new Error();

		if (beginEdge.Norm.Dot(endEdge.Norm) < -0.97) {
			const n1 = PrimitiveUtils.FromTo(endPreviousVertex.Point, bisector.A).Normalized();
			const n2 = PrimitiveUtils.FromTo(bisector.A, beginNextVertex.Point).Normalized();
			const bisectorPrediction = this.CalcVectorBisector(n1, n2);

			if (bisector.U.Dot(bisectorPrediction) < 0)
				bisector.U.Negate();
		}
	}

	private static AddSplitFaces(lastFaceNode: FaceNode, chainBegin: IChain, chainEnd: IChain, newVertex: Vertex): FaceNode {
		if (chainBegin instanceof SingleEdgeChain) {
			if (lastFaceNode === null) {
				const beginVertex = this.CreateOppositeEdgeVertex(newVertex);

				newVertex.RightFace = beginVertex.RightFace;
				lastFaceNode = beginVertex.LeftFace;
			} else {
				if (newVertex.RightFace !== null)
					throw new Error("newVertex.RightFace should be null");

				newVertex.RightFace = lastFaceNode;
				lastFaceNode = null;
			}
		} else {
			const beginVertex = chainBegin.CurrentVertex;
			this.AddFaceRight(newVertex, beginVertex);
		}

		if (chainEnd instanceof SingleEdgeChain) {
			if (lastFaceNode === null) {
				const endVertex = this.CreateOppositeEdgeVertex(newVertex);

				newVertex.LeftFace = endVertex.LeftFace;
				lastFaceNode = endVertex.LeftFace;
			} else {
				if (newVertex.LeftFace !== null)
					throw new Error("newVertex.LeftFace should be null.");
				newVertex.LeftFace = lastFaceNode;

				lastFaceNode = null;
			}
		} else {
			const endVertex = chainEnd.CurrentVertex;
			this.AddFaceLeft(newVertex, endVertex);
		}
		return lastFaceNode;
	}

	private static CreateOppositeEdgeVertex(newVertex: Vertex): Vertex {
		const vertex = new Vertex(newVertex.Point, newVertex.Distance, newVertex.Bisector, newVertex.PreviousEdge, newVertex.NextEdge);

		const fn = new FaceNode(vertex);
		vertex.LeftFace = fn;
		vertex.RightFace = fn;

		const rightFace = new FaceQueue();
		rightFace.AddFirst(fn);

		return vertex;
	}

	private static CreateOppositeEdgeChains(sLav: HashSet<CircularList<Vertex>>, chains: List<IChain>, center: Vector2d) {
		const oppositeEdges = new HashSet<Edge>();

		const oppositeEdgeChains = new List<IChain>();
		const chainsForRemoval = new List<IChain>();

		for (const chain of chains) {
			if (chain instanceof SplitChain) {
				const splitChain = <SplitChain>chain;
				const oppositeEdge = splitChain.OppositeEdge;

				if (oppositeEdge !== null && !oppositeEdges.Contains(oppositeEdge)) {
					const nextVertex = this.FindOppositeEdgeLav(sLav, oppositeEdge, center);

					if (nextVertex !== null)
						oppositeEdgeChains.Add(new SingleEdgeChain(oppositeEdge, nextVertex));
					else {
						this.FindOppositeEdgeLav(sLav, oppositeEdge, center);
						chainsForRemoval.Add(chain);
					}
					oppositeEdges.Add(oppositeEdge);
				}
			}
		}

		for (let chain of chainsForRemoval)
			chains.Remove(chain);

		chains.AddRange(oppositeEdgeChains);
	}

	private static CreateMultiSplitVertex(nextEdge: Edge, previousEdge: Edge, center: Vector2d, distance: number): Vertex {
		const bisector = this.CalcBisector(center, previousEdge, nextEdge);
		return new Vertex(center, distance, bisector, previousEdge, nextEdge);
	}

	private static CreateChains(cluster: List<SkeletonEvent>): List<IChain> {
		const edgeCluster = new List<EdgeEvent>();
		const splitCluster = new List<SplitEvent>();
		const vertexEventsParents = new HashSet<Vertex>();

		for (const skeletonEvent of cluster) {
			if (skeletonEvent instanceof EdgeEvent)
				edgeCluster.Add(<EdgeEvent>skeletonEvent);
			else {
				if (skeletonEvent instanceof VertexSplitEvent) {

				} else if (skeletonEvent instanceof SplitEvent) {
					const splitEvent = <SplitEvent>skeletonEvent;
					vertexEventsParents.Add(splitEvent.Parent);
					splitCluster.Add(splitEvent);
				}
			}
		}

		for (let skeletonEvent of cluster) {
			if (skeletonEvent instanceof VertexSplitEvent) {
				const vertexEvent = <VertexSplitEvent>skeletonEvent;
				if (!vertexEventsParents.Contains(vertexEvent.Parent)) {
					vertexEventsParents.Add(vertexEvent.Parent);
					splitCluster.Add(vertexEvent);
				}
			}
		}

		const edgeChains = new List<EdgeChain>();

		while (edgeCluster.Count > 0)
			edgeChains.Add(new EdgeChain(this.CreateEdgeChain(edgeCluster)));

		const chains = new List<IChain>(edgeChains.Count);
		for (const edgeChain of edgeChains)
			chains.Add(edgeChain);

		splitEventLoop:
			while (splitCluster.Any()) {
				const split = splitCluster[0];
				splitCluster.RemoveAt(0);

				for (const chain of edgeChains) {
					if (this.IsInEdgeChain(split, chain))
						continue splitEventLoop; //goto splitEventLoop;
				}

				chains.Add(new SplitChain(split));
			}

		return chains;
	}

	private static IsInEdgeChain(split: SplitEvent, chain: EdgeChain): boolean {
		const splitParent = split.Parent;
		const edgeList = chain.EdgeList;

		return edgeList.Any(edgeEvent => edgeEvent.PreviousVertex === splitParent || edgeEvent.NextVertex === splitParent);
	}

	private static CreateEdgeChain(edgeCluster: List<EdgeEvent>): List<EdgeEvent> {
		const edgeList = new List<EdgeEvent>();

		edgeList.Add(edgeCluster[0]);
		edgeCluster.RemoveAt(0);

		loop:
			for (; ;) {
				const beginVertex = edgeList[0].PreviousVertex;
				const endVertex = edgeList[edgeList.Count - 1].NextVertex;

				for (let i = 0; i < edgeCluster.Count; i++) {
					const edge = edgeCluster[i];
					if (edge.PreviousVertex === endVertex) {
						edgeCluster.RemoveAt(i);
						edgeList.Add(edge);
						//goto loop;
						continue loop;

					}
					if (edge.NextVertex === beginVertex) {
						edgeCluster.RemoveAt(i);
						edgeList.Insert(0, edge);
						//goto loop;
						continue loop;
					}
				}
				break;
			}

		return edgeList;
	}

	private static RemoveEventsUnderHeight(queue: PriorityQueue<SkeletonEvent>, levelHeight: number) {
		while (!queue.Empty) {
			if (queue.Peek().Distance > levelHeight + this.SplitEpsilon)
				break;
			queue.Next();
		}
	}

	private static LoadAndGroupLevelEvents(queue: PriorityQueue<SkeletonEvent>): List<SkeletonEvent> {
		const levelEvents = this.LoadLevelEvents(queue);
		return this.GroupLevelEvents(levelEvents);
	}

	private static GroupLevelEvents(levelEvents: List<SkeletonEvent>): List<SkeletonEvent> {
		const ret = new List<SkeletonEvent>();

		const parentGroup = new HashSet<Vertex>();

		while (levelEvents.Count > 0) {
			parentGroup.Clear();

			const event = levelEvents[0];
			levelEvents.RemoveAt(0);
			const eventCenter = event.V;
			const distance = event.Distance;

			this.AddEventToGroup(parentGroup, event);

			const cluster = new List<SkeletonEvent>();
			cluster.Add(event);

			for (let j = 0; j < levelEvents.Count; j++) {
				const test = levelEvents[j];

				if (this.IsEventInGroup(parentGroup, test)) {
					const item = levelEvents[j];
					levelEvents.RemoveAt(j);
					cluster.Add(item);
					this.AddEventToGroup(parentGroup, test);
					j--;
				} else if (eventCenter.DistanceTo(test.V) < this.SplitEpsilon) {
					const item = levelEvents[j];
					levelEvents.RemoveAt(j);
					cluster.Add(item);
					this.AddEventToGroup(parentGroup, test);
					j--;
				}
			}

			ret.Add(this.CreateLevelEvent(eventCenter, distance, cluster));
		}
		return ret;
	}

	private static IsEventInGroup(parentGroup: HashSet<Vertex>, event: SkeletonEvent): boolean {
		if (event instanceof SplitEvent)
			return parentGroup.Contains((<SplitEvent>event).Parent);
		if (event instanceof EdgeEvent)
			return parentGroup.Contains((<EdgeEvent>event).PreviousVertex)
				|| parentGroup.Contains((<EdgeEvent>event).NextVertex);
		return false;
	}

	private static AddEventToGroup(parentGroup: HashSet<Vertex>, event: SkeletonEvent) {
		if (event instanceof SplitEvent)
			parentGroup.Add((<SplitEvent>event).Parent);
		else if (event instanceof EdgeEvent) {
			parentGroup.Add((<EdgeEvent>event).PreviousVertex);
			parentGroup.Add((<EdgeEvent>event).NextVertex);
		}
	}

	private static CreateLevelEvent(eventCenter: Vector2d, distance: number, eventCluster: List<SkeletonEvent>): SkeletonEvent {
		const chains = this.CreateChains(eventCluster);

		if (chains.Count === 1) {
			const chain = chains[0];
			if (chain.ChainType === ChainType.ClosedEdge)
				return new PickEvent(eventCenter, distance, <EdgeChain>chain);
			if (chain.ChainType === ChainType.Edge)
				return new MultiEdgeEvent(eventCenter, distance, <EdgeChain>chain);
			if (chain.ChainType === ChainType.Split)
				return new MultiSplitEvent(eventCenter, distance, chains);
		}

		if (chains.Any(chain => chain.ChainType === ChainType.ClosedEdge))
			throw new Error("Found closed chain of events for single point, but found more then one chain");
		return new MultiSplitEvent(eventCenter, distance, chains);
	}

	private static LoadLevelEvents(queue: PriorityQueue<SkeletonEvent>): List<SkeletonEvent> {
		const level = new List<SkeletonEvent>();
		let levelStart: SkeletonEvent;

		do {
			levelStart = queue.Empty ? null : queue.Next();
		}
		while (levelStart !== null && levelStart.IsObsolete);


		if (levelStart === null || levelStart.IsObsolete)
			return level;

		const levelStartHeight = levelStart.Distance;

		level.Add(levelStart);

		let event: SkeletonEvent;
		while ((event = queue.Peek()) !== null &&
		Math.abs(event.Distance - levelStartHeight) < this.SplitEpsilon) {
			const nextLevelEvent = queue.Next();
			if (!nextLevelEvent.IsObsolete)
				level.Add(nextLevelEvent);
		}
		return level;
	}

	private static AssertMaxNumberOfInteraction(count: number): number {
		count++;
		if (count > 10000)
			throw new Error("Too many interaction: bug?");
		return count;
	}

	private static MakeClockwise(holes: List<List<Vector2d>>): List<List<Vector2d>> {
		if (holes === null)
			return null;

		const ret = new List<List<Vector2d>>(holes.Count);
		for (const hole of holes) {
			if (PrimitiveUtils.IsClockwisePolygon(hole))
				ret.Add(hole);
			else {
				hole.Reverse();
				ret.Add(hole);
			}
		}
		return ret;
	}

	private static MakeCounterClockwise(polygon: List<Vector2d>): List<Vector2d> {
		return PrimitiveUtils.MakeCounterClockwise(polygon);
	}

	private static InitSlav(polygon: List<Vector2d>, sLav: HashSet<CircularList<Vertex>>, edges: List<Edge>, faces: List<FaceQueue>) {
		const edgesList = new CircularList<Edge>();

		const size = polygon.Count;
		for (let i = 0; i < size; i++) {
			const j = (i + 1) % size;
			edgesList.AddLast(new Edge(polygon[i], polygon[j]));
		}

		for (const edge of edgesList.Iterate()) {
			const nextEdge = edge.Next as Edge;
			const bisector = this.CalcBisector(edge.End, edge, nextEdge);

			edge.BisectorNext = bisector;
			nextEdge.BisectorPrevious = bisector;
			edges.Add(edge);
		}

		const lav = new CircularList<Vertex>();
		sLav.Add(lav);

		for (const edge of edgesList.Iterate()) {
			const nextEdge = edge.Next as Edge;
			const vertex = new Vertex(edge.End, 0, edge.BisectorNext, edge, nextEdge);
			lav.AddLast(vertex);
		}

		for (const vertex of lav.Iterate()) {
			const next = vertex.Next as Vertex;
			const rightFace = new FaceNode(vertex);

			const faceQueue = new FaceQueue();
			faceQueue.Edge = (vertex.NextEdge);

			faceQueue.AddFirst(rightFace);
			faces.Add(faceQueue);
			vertex.RightFace = rightFace;

			const leftFace = new FaceNode(next);
			rightFace.AddPush(leftFace);
			next.LeftFace = leftFace;
		}
	}

	private static AddFacesToOutput(faces: List<FaceQueue>): Skeleton {
		const edgeOutputs = new List<EdgeResult>();
		const distances = new Dictionary<Vector2d, number>();

		for (const face of faces) {
			if (face.Size > 0) {
				const faceList = new List<Vector2d>();

				for (const fn of face.Iterate()) {
					const point = fn.Vertex.Point;

					faceList.Add(point);

					if (!distances.ContainsKey(point))
						distances.Add(point, fn.Vertex.Distance);
				}

				edgeOutputs.Add(new EdgeResult(face.Edge, faceList));
			}
		}
		return new Skeleton(edgeOutputs, distances);
	}

	private static InitEvents(sLav: HashSet<CircularList<Vertex>>, queue: PriorityQueue<SkeletonEvent>, edges: List<Edge>) {
		for (const lav of sLav) {
			for (const vertex of lav.Iterate())
				this.ComputeSplitEvents(vertex, edges, queue, -1);
		}

		for (const lav of sLav) {
			for (const vertex of lav.Iterate()) {
				const nextVertex = vertex.Next as Vertex;
				this.ComputeEdgeEvents(vertex, nextVertex, queue);
			}
		}
	}

	private static ComputeSplitEvents(vertex: Vertex, edges: List<Edge>, queue: PriorityQueue<SkeletonEvent>, distanceSquared: number) {
		const source = vertex.Point;
		const oppositeEdges = this.CalcOppositeEdges(vertex, edges);

		for (const oppositeEdge of oppositeEdges) {
			const point = oppositeEdge.Point;

			if (Math.abs(distanceSquared - (-1)) > this.SplitEpsilon) {
				if (source.DistanceSquared(point) > distanceSquared + this.SplitEpsilon) {
					continue;
				}
			}

			if (oppositeEdge.OppositePoint.NotEquals(Vector2d.Empty)) {
				queue.Add(new VertexSplitEvent(point, oppositeEdge.Distance, vertex));
				continue;
			}
			queue.Add(new SplitEvent(point, oppositeEdge.Distance, vertex, oppositeEdge.OppositeEdge));
		}
	}

	private static ComputeEvents(vertex: Vertex, queue: PriorityQueue<SkeletonEvent>, edges: List<Edge>) {
		const distanceSquared = this.ComputeCloserEdgeEvent(vertex, queue);
		this.ComputeSplitEvents(vertex, edges, queue, distanceSquared);
	}

	private static ComputeCloserEdgeEvent(vertex: Vertex, queue: PriorityQueue<SkeletonEvent>): number {
		const nextVertex = vertex.Next as Vertex;
		const previousVertex = vertex.Previous as Vertex;

		const point = vertex.Point;

		const point1 = this.ComputeIntersectionBisectors(vertex, nextVertex);
		const point2 = this.ComputeIntersectionBisectors(previousVertex, vertex);

		if (point1.Equals(Vector2d.Empty) && point2.Equals(Vector2d.Empty))
			return -1;

		let distance1 = Number.MAX_VALUE;
		let distance2 = Number.MAX_VALUE;

		if (point1.NotEquals(Vector2d.Empty))
			distance1 = point.DistanceSquared(point1);
		if (point2.NotEquals(Vector2d.Empty))
			distance2 = point.DistanceSquared(point2);

		if (Math.abs(distance1 - this.SplitEpsilon) < distance2)
			queue.Add(this.CreateEdgeEvent(point1, vertex, nextVertex));
		if (Math.abs(distance2 - this.SplitEpsilon) < distance1)
			queue.Add(this.CreateEdgeEvent(point2, previousVertex, vertex));

		return distance1 < distance2 ? distance1 : distance2;
	}

	private static CreateEdgeEvent(point: Vector2d, previousVertex: Vertex, nextVertex: Vertex): SkeletonEvent {
		return new EdgeEvent(point, this.CalcDistance(point, previousVertex.NextEdge), previousVertex, nextVertex);
	}

	private static ComputeEdgeEvents(previousVertex: Vertex, nextVertex: Vertex, queue: PriorityQueue<SkeletonEvent>) {
		const point = this.ComputeIntersectionBisectors(previousVertex, nextVertex);
		if (point.NotEquals(Vector2d.Empty))
			queue.Add(this.CreateEdgeEvent(point, previousVertex, nextVertex));
	}

	private static CalcOppositeEdges(vertex: Vertex, edges: List<Edge>): List<SplitCandidate> {
		const ret = new List<SplitCandidate>();

		for (const edgeEntry of edges) {
			const edge = edgeEntry.LineLinear2d;

			if (this.EdgeBehindBisector(vertex.Bisector, edge))
				continue;

			const candidatePoint = this.CalcCandidatePointForSplit(vertex, edgeEntry);
			if (candidatePoint !== null)
				ret.Add(candidatePoint);
		}

		ret.Sort(new SplitCandidateComparer());
		return ret;
	}

	private static EdgeBehindBisector(bisector: LineParametric2d, edge: LineLinear2d): boolean {
		return LineParametric2d.Collide(bisector, edge, this.SplitEpsilon).Equals(Vector2d.Empty);
	}

	private static CalcCandidatePointForSplit(vertex: Vertex, edge: Edge): SplitCandidate {
		const vertexEdge = this.ChoseLessParallelVertexEdge(vertex, edge);
		if (vertexEdge === null)
			return null;

		const vertexEdteNormNegate = vertexEdge.Norm;
		const edgesBisector = this.CalcVectorBisector(vertexEdteNormNegate, edge.Norm);
		const edgesCollide = vertexEdge.LineLinear2d.Collide(edge.LineLinear2d);

		if (edgesCollide.Equals(Vector2d.Empty))
			throw new Error("Ups this should not happen");

		const edgesBisectorLine = new LineParametric2d(edgesCollide, edgesBisector).CreateLinearForm();

		const candidatePoint = LineParametric2d.Collide(vertex.Bisector, edgesBisectorLine, this.SplitEpsilon);

		if (candidatePoint.Equals(Vector2d.Empty))
			return null;

		if (edge.BisectorPrevious.IsOnRightSite(candidatePoint, this.SplitEpsilon)
			&& edge.BisectorNext.IsOnLeftSite(candidatePoint, this.SplitEpsilon)) {
			const distance = this.CalcDistance(candidatePoint, edge);

			if (edge.BisectorPrevious.IsOnLeftSite(candidatePoint, this.SplitEpsilon))
				return new SplitCandidate(candidatePoint, distance, null, edge.Begin);
			if (edge.BisectorNext.IsOnRightSite(candidatePoint, this.SplitEpsilon))
				return new SplitCandidate(candidatePoint, distance, null, edge.Begin);

			return new SplitCandidate(candidatePoint, distance, edge, Vector2d.Empty);
		}

		return null;
	}

	private static ChoseLessParallelVertexEdge(vertex: Vertex, edge: Edge): Edge {
		const edgeA = vertex.PreviousEdge;
		const edgeB = vertex.NextEdge;

		let vertexEdge = edgeA;

		const edgeADot = Math.abs(edge.Norm.Dot(edgeA.Norm));
		const edgeBDot = Math.abs(edge.Norm.Dot(edgeB.Norm));

		if (edgeADot + edgeBDot >= 2 - this.SplitEpsilon)
			return null;

		if (edgeADot > edgeBDot)
			vertexEdge = edgeB;

		return vertexEdge;
	}

	private static ComputeIntersectionBisectors(vertexPrevious: Vertex, vertexNext: Vertex): Vector2d {
		const bisectorPrevious = vertexPrevious.Bisector;
		const bisectorNext = vertexNext.Bisector;

		const intersectRays2d = PrimitiveUtils.IntersectRays2D(bisectorPrevious, bisectorNext);
		const intersect = intersectRays2d.Intersect;

		if (vertexPrevious.Point.Equals(intersect) || vertexNext.Point.Equals(intersect))
			return Vector2d.Empty;

		return intersect;
	}

	private static FindOppositeEdgeLav(sLav: HashSet<CircularList<Vertex>>, oppositeEdge: Edge, center: Vector2d): Vertex {
		const edgeLavs = this.FindEdgeLavs(sLav, oppositeEdge, null);
		return this.ChooseOppositeEdgeLav(edgeLavs, oppositeEdge, center);
	}

	private static ChooseOppositeEdgeLav(edgeLavs: List<Vertex>, oppositeEdge: Edge, center: Vector2d): Vertex {
		if (!edgeLavs.Any())
			return null;

		if (edgeLavs.Count === 1)
			return edgeLavs[0];

		const edgeStart = oppositeEdge.Begin;
		const edgeNorm = oppositeEdge.Norm;
		const centerVector = center.Sub(edgeStart);
		const centerDot = edgeNorm.Dot(centerVector);
		for (const end of edgeLavs) {
			const begin = end.Previous as Vertex;

			const beginVector = begin.Point.Sub(edgeStart);
			const endVector = end.Point.Sub(edgeStart);

			const beginDot = edgeNorm.Dot(beginVector);
			const endDot = edgeNorm.Dot(endVector);

			if (beginDot < centerDot && centerDot < endDot ||
				beginDot > centerDot && centerDot > endDot)
				return end;
		}

		for (const end of edgeLavs) {
			const size = end.List.Size;
			const points = new List<Vector2d>(size);
			let next = end;
			for (let i = 0; i < size; i++) {
				points.Add(next.Point);
				next = next.Next as Vertex;
			}
			if (PrimitiveUtils.IsPointInsidePolygon(center, points))
				return end;
		}
		throw new Error("Could not find lav for opposite edge, it could be correct but need some test data to check.");
	}

	private static FindEdgeLavs(sLav: HashSet<CircularList<Vertex>>, oppositeEdge: Edge, skippedLav: CircularList<Vertex>): List<Vertex> {
		const edgeLavs = new List<Vertex>();
		for (const lav of sLav) {
			if (lav === skippedLav)
				continue;

			const vertexInLav = this.GetEdgeInLav(lav, oppositeEdge);
			if (vertexInLav !== null)
				edgeLavs.Add(vertexInLav);
		}
		return edgeLavs;
	}

	private static GetEdgeInLav(lav: CircularList<Vertex>, oppositeEdge: Edge): Vertex {
		for (const node of lav.Iterate())
			if (oppositeEdge === node.PreviousEdge ||
				oppositeEdge === node.Previous.Next)
				return node;

		return null;
	}

	private static AddFaceBack(newVertex: Vertex, va: Vertex, vb: Vertex) {
		const fn = new FaceNode(newVertex);
		va.RightFace.AddPush(fn);
		FaceQueueUtil.ConnectQueues(fn, vb.LeftFace);
	}

	private static AddFaceRight(newVertex: Vertex, vb: Vertex) {
		const fn = new FaceNode(newVertex);
		vb.RightFace.AddPush(fn);
		newVertex.RightFace = fn;
	}

	private static AddFaceLeft(newVertex: Vertex, va: Vertex) {
		const fn = new FaceNode(newVertex);
		va.LeftFace.AddPush(fn);
		newVertex.LeftFace = fn;
	}

	private static CalcDistance(intersect: Vector2d, currentEdge: Edge): number {
		const edge = currentEdge.End.Sub(currentEdge.Begin);
		const vector = intersect.Sub(currentEdge.Begin);

		const pointOnVector = PrimitiveUtils.OrthogonalProjection(edge, vector);
		return vector.DistanceTo(pointOnVector);
	}

	private static CalcBisector(p: Vector2d, e1: Edge, e2: Edge): LineParametric2d {
		const norm1 = e1.Norm;
		const norm2 = e2.Norm;

		const bisector = this.CalcVectorBisector(norm1, norm2);
		return new LineParametric2d(p, bisector);
	}

	private static CalcVectorBisector(norm1: Vector2d, norm2: Vector2d): Vector2d {
		return PrimitiveUtils.BisectorNormalized(norm1, norm2);
	}
}

class SkeletonEventDistanseComparer implements IComparer<SkeletonEvent> {
	public Compare(left: SkeletonEvent, right: SkeletonEvent): number {
		if (left.Distance > right.Distance)
			return 1;
		if (left.Distance < right.Distance)
			return -1;

		return 0;
	}
}

class ChainComparer implements IComparer<IChain> {
	private readonly _center: Vector2d;

	constructor(center: Vector2d) {
		this._center = center;
	}

	public Compare(x: IChain, y: IChain): number {
		if (x === y)
			return 0;

		const angle1 = ChainComparer.Angle(this._center, x.PreviousEdge.Begin);
		const angle2 = ChainComparer.Angle(this._center, y.PreviousEdge.Begin);

		return angle1 > angle2 ? 1 : -1;
	}

	private static Angle(p0: Vector2d, p1: Vector2d): number {
		const dx = p1.X - p0.X;
		const dy = p1.Y - p0.Y;
		return Math.atan2(dy, dx);
	}
}

class SplitCandidateComparer implements IComparer<SplitCandidate> {
	public Compare(left: SplitCandidate, right: SplitCandidate): number {
		if (left.Distance > right.Distance)
			return 1;
		if (left.Distance < right.Distance)
			return -1;

		return 0;
	}
}

class SplitCandidate {
	public readonly Distance: number;
	public readonly OppositeEdge: Edge = null;
	public readonly OppositePoint: Vector2d = null;
	public readonly Point: Vector2d = null;

	constructor(point: Vector2d, distance: number, oppositeEdge: Edge, oppositePoint: Vector2d) {
		this.Point = point;
		this.Distance = distance;
		this.OppositeEdge = oppositeEdge;
		this.OppositePoint = oppositePoint;
	}
}

