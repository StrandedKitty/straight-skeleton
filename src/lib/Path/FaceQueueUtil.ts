import {FaceNode} from "./FaceNode";

export default class FaceQueueUtil {
	public static ConnectQueues(firstFace: FaceNode, secondFace: FaceNode) {
		if (firstFace.List === null)
			throw new Error("firstFace.list cannot be null.");
		if (secondFace.List === null)
			throw new Error("secondFace.list cannot be null.");

		if (firstFace.List === secondFace.List) {
			if (!firstFace.IsEnd || !secondFace.IsEnd)
				throw new Error("try to connect the same list not on end nodes");

			if (firstFace.IsQueueUnconnected || secondFace.IsQueueUnconnected)
				throw new Error("can't close node queue not conected with edges");

			firstFace.QueueClose();
			return;
		}

		if (!firstFace.IsQueueUnconnected && !secondFace.IsQueueUnconnected)
			throw new Error(
				"can't connect two diffrent queues if each of them is connected to edge");

		if (!firstFace.IsQueueUnconnected) {
			const qLeft = secondFace.FaceQueue;
			this.MoveNodes(firstFace, secondFace);
			qLeft.Close();
		} else {
			const qRight = firstFace.FaceQueue;
			this.MoveNodes(secondFace, firstFace);
			qRight.Close();
		}
	}

	private static MoveNodes(firstFace: FaceNode, secondFace: FaceNode) {
		firstFace.AddQueue(secondFace);
	}
}