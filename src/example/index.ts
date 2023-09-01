import {SkeletonBuilder} from '../wrapper';

const input: [number, number][][] = [
	[
		[-1, -1],
		[0, -12],
		[1, -1],
		[12, 0],
		[1, 1],
		[0, 12],
		[-1, 1],
		[-12, 0],
		[-1, -1]
	], [
		[-1, 0],
		[0, 1],
		[1, 0],
		[0, -1],
		[-1, 0]
	]
];

const main = async () => {
	await SkeletonBuilder.init();
	const skeleton = SkeletonBuilder.buildFromPolygon(input);

	console.log(skeleton);
};

main();
