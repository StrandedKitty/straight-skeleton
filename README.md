# straight-skeleton

![](https://i.imgur.com/bowQUJY.png)

This is a TypeScript library that wraps the basic functionality of CGAL's [straight skeleton implementation](https://doc.cgal.org/latest/Straight_skeleton_2/index.html) using Wasm (WebAssembly).
You can use this library to generate unweighted straight skeletons of polygons with or without holes.

If you are interested in a less robust but more fast straight skeleton implementation that's written in pure TypeScript, check out [v1](https://github.com/StrandedKitty/straight-skeleton/tree/v1) of this library.

## Demo

[Live playground](https://strandedkitty.github.io/straight-skeleton/example/)

## Installation

`npm i straight-skeleton`

## Usage

This library supports both arrays of points (`SkeletonBuilder.buildFromPolygon`) and [GeoJSON polygons](https://datatracker.ietf.org/doc/html/rfc7946#autoid-15) (`SkeletonBuilder.buildFromGeoJSON`).

### Input requirements

- Input polygon must have at least one ring.
- The first ring is always the outer ring, and the rest are inner rings.
- Outer rings must be counter-clockwise oriented and inner rings must be clockwise oriented.
- All rings must be weakly simple.
- Each ring must have a duplicate of the first vertex at the end.

### Example

```typescript
import {SkeletonBuilder} from 'straight-skeleton';

// Contains two rings: outer and inner.
const polygon = [
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

// Initialize the Wasm module by calling init() once.
SkeletonBuilder.init().then(() => {
	const result = SkeletonBuilder.buildFromPolygon(polygon);
	
	// Check if the skeleton was successfully constructed
	if (result !== null) {
		for (const vertex of result.vertices) {
			// Do something with vertices
		}

		for (const polygon of result.polygons) {
			// Do something with polygons
		}
	}
});
```

## Development

1. Clone this repository.
2. Run `npm i` to install dependencies.
3. Optionally, rebuild the Wasm module:
   1. Install [Emscripten](https://emscripten.org/docs/getting_started/downloads.html) and make sure that it's in your PATH.
   2. `cd src/core`, then `sh ./install_libraries.sh` to download and unpack all dependencies.
   3. `mkdir build && cd build` to create a build directory.
   4. `emcmake cmake ..` to generate the build files.
   5. `emmake make` to build the Wasm module. Rerun this whenever your .cpp files change.
4. Run `npm run build` to build the library or `npm run dev` to start a development server that watches for changes.

## References

* [CGAL straight skeleton user manual](https://doc.cgal.org/latest/Straight_skeleton_2/index.html)
