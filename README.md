# straight-skeleton

![](https://i.imgur.com/ecT8io4.png)

This is a TypeScript library that wraps the basic functionality of CGAL's [straight skeleton implementation](https://doc.cgal.org/latest/Straight_skeleton_2/index.html) using Wasm (WebAssembly).
You can use this library to generate unweighted straight skeletons of polygons with or without holes.

## Demo

[Live playground](https://strandedkitty.github.io/straight-skeleton/example/)

## Installation

`npm i straight-skeleton`

## Usage

This port supports both [GeoJSON polygons](https://geojson.org/geojson-spec.html#polygon) and simple arrays of 2D points.

```typescript
import {SkeletonBuilder} from 'straight-skeleton';

const skeleton = SkeletonBuilder.BuildFromGeoJSON([[
	[[0, 0], [100, 0], [100, 50], [0, 50]],    // outer
	[[50, 30], [70, 30], [70, 20], [50, 20]],  // inner
]]);

for (const edgeResult of s.Edges) {
	// A list of 2D points representing a polygon adjacent to the edge.
	const polygon = edgeResult.Polygon;
	// ...
}

// If you want to construct 3D roofs you also need the height data produced by the builder.
for (const [pointPos, distance] of s.Distances) {
	// `distance` is the elevation of the vertex located on `pointPos`.
	// ...
}
```

## Development



## References

* [CGAL straight skeleton user manual](https://doc.cgal.org/latest/Straight_skeleton_2/index.html)
