import Edge from "../../Circular/Edge";
import Vertex from "../../Circular/Vertex";
import ChainType from "./ChainType";

export default interface IChain {
	get PreviousEdge(): Edge;

	get NextEdge(): Edge;

	get PreviousVertex(): Vertex;

	get NextVertex(): Vertex;

	get CurrentVertex(): Vertex;

	get ChainType(): ChainType;
}