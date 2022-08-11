# straight-skeleton

![](https://i.imgur.com/ecT8io4.png)

This is a TypeScript port of [C# straight skeleton
implementation](https://github.com/reinterpretcat/csharp-libs/tree/master/straight_skeleton).

> Implementation of straight skeleton algorithm for polygons with holes. It is based on concept of tracking bisector intersection with queue of events to process and circular list with processed events called lavs. This implementation is highly modified concept described by Petr Felkel and Stepan Obdrzalek. In compare to original this algorithm has new kind of event and support for multiple events which appear in the same distance from edges. It is common when processing degenerate cases caused by polygon with right angles.

This port, like the original library, doesn't rely on any external math libs. There were no major changes made to the original code structure. Some utility classes and interfaces which serve as a replacement for corresponding C# ones can be found in `Utils.ts`.

## Demo

[Live playground](https://strandedkitty.github.io/straight-skeleton/example/)

## Installation

`npm i straight-skeleton`

## Usage

This port supports [GeoJSON multipolygons](https://geojson.org/geojson-spec.html#multipolygon) as input.

```typescript
import SkeletonBuilder from 'straight-skeleton';

const skeleton = SkeletonBuilder.BuildFromGeoJSON([[
	[[0, 0], [100, 0], [100, 50], [0, 50]],    // outer
	[[50, 30], [70, 30], [70, 20], [50, 20]],  // inner
]]);

for (const edgeResult of s.Edges) {
	// A list of 2D points representing a polygon adjacent to the edge.
	const polygon = edgeResult.Polygon;
	...
}

// If you want to construct 3D roofs you also need the height data produced by the builder.
for (const [pointPos, distance] of s.Distances) {
	// `distance` is the height of the point located on coordinates `pointPos`.
	...
}
```

## References

* [Original C# straight skeleton implementation by reinterpretcat](https://github.com/reinterpretcat/csharp-libs/tree/master/straight_skeleton)
