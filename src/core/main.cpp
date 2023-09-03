#ifdef EMSCRIPTEN
//#define CGAL_ALWAYS_ROUND_TO_NEAREST
#define CGAL_NO_ASSERTIONS
#define CGAL_NO_PRECONDITIONS
#define CGAL_NO_POSTCONDITIONS
#define CGAL_NO_WARNINGS
#include <emscripten.h>
#include <emscripten/bind.h>
#endif

#include <iostream>
#include <vector>
#include <CGAL/Uncertain.h>
#include <CGAL/enum.h>
#include <CGAL/Exact_predicates_inexact_constructions_kernel.h>
#include <CGAL/Polygon_with_holes_2.h>
#include <CGAL/create_straight_skeleton_from_polygon_with_holes_2.h>
#include <CGAL/Straight_skeleton_2/IO/print.h>
#include <boost/shared_ptr.hpp>
#include <cassert>

// Override make_certain to fix errors. Not sure why Uncertain doesn't work properly in Wasm environment.
template <>
bool CGAL::Uncertain<bool>::make_certain() const {
	return _i;
}

template <>
CGAL::Sign CGAL::Uncertain<CGAL::Sign>::make_certain() const {
	return _i;
}

typedef CGAL::Exact_predicates_inexact_constructions_kernel K;
typedef K::Point_2 Point;
typedef CGAL::Polygon_2<K> Polygon_2;
typedef CGAL::Polygon_with_holes_2<K> Polygon_with_holes;
typedef CGAL::Straight_skeleton_2<K> Ss;
typedef boost::shared_ptr<Ss> SsPtr;
typedef CGAL::Exact_predicates_inexact_constructions_kernel CGAL_KERNEL;

// Decodes rings from data and generates a skeleton from them.
// Data contains a list of rings, each ring is represented by a number of points (uint32_t), followed by the points
// themselves (each point is represented by 2 floats: x, y).
// The last value is 0.
SsPtr generate_skeleton(void *data) {
	uint32_t *data_uint32 = (uint32_t *)data;
	uint32_t points = data_uint32[0];

	assert(points != 0);
	assert(points > 2);

	++data_uint32;

	Polygon_2 outer;
	Polygon_2 hole;
	Polygon_with_holes poly;
	bool outer_set = false;

	while (points != 0) {
		Polygon_2 *target = outer_set ? &hole : &outer;

		for (long i = 0; i < points; i++) {
			float x = *((float *)data_uint32 + i * 2);
			float y = *((float *)data_uint32 + i * 2 + 1);

			target->push_back(Point(x, y));
		}

		data_uint32 += points * 2;

		points = data_uint32[0];

		++data_uint32;

		if (!outer_set) {
			assert(outer.is_counterclockwise_oriented());
			poly = Polygon_with_holes(outer);
			outer_set = true;
		} else {
			assert(hole.is_clockwise_oriented());
			poly.add_hole(hole);
			hole.clear();
		}
	}

	return CGAL::create_interior_straight_skeleton_2(poly);
}

// Serializes a skeleton into a format that can be sent to the JS side.
// The first part of the data describes the vertices:
// The first value (uint32_t) specifies the number of vertices.
// After that, each vertex is represented by 3 floats: x, y, time.
// Then, the second part describes the faces:
// Each face is represented by a uint32_t specifying the number of vertices in the face, followed by the indices
// of its vertices (also uint32_t).
// The last value is 0.
void *serialize_skeleton(SsPtr iss) {
	if (iss == nullptr) {
		return nullptr;
	}

	std::unordered_map<Ss::Vertex_const_handle, int> vertex_map;
	std::vector<std::tuple<float, float, float>> vertices;

	for (auto vertex = iss->vertices_begin(); vertex != iss->vertices_end(); ++vertex) {
		CGAL::Point_2 point = vertex->point();

		vertices.emplace_back(point.x(), point.y(), vertex->time());
		vertex_map[vertex] = vertices.size() - 1;
	}

	std::vector<std::vector<uint32_t>> faces;
	int total_vertices = 0;

	for (auto face = iss->faces_begin(); face != iss->faces_end(); ++face) {
		std::vector<uint32_t> face_polygon;

		for (auto h = face->halfedge();;) {
			auto vertex_index = (uint32_t)vertex_map[h->vertex()];
			face_polygon.push_back(vertex_index);
			++total_vertices;

			h = h->next();

			if (h == face->halfedge()) {
				break;
			}
		}

		faces.emplace_back(face_polygon);
	}

	int total_size = 1 + vertices.size() * 3 + faces.size() + total_vertices + 1;
	uint32_t *data = (uint32_t *)malloc(total_size * sizeof(uint32_t));
	float *data_float = (float *)data;
	int i = 0;

	data[i++] = vertices.size();

	for (auto vertex : vertices) {
		data_float[i++] = std::get<0>(vertex);
		data_float[i++] = std::get<1>(vertex);
		data_float[i++] = std::get<2>(vertex);
	}

	for (auto face : faces) {
		data[i++] = face.size();

		for (auto vertex_index : face) {
			data[i++] = vertex_index;
		}
	}

	data[i++] = 0;

	return data;
}

extern "C" {
	EMSCRIPTEN_KEEPALIVE
	void *create_straight_skeleton(void *data) {
		SsPtr skeleton = generate_skeleton(data);

		return serialize_skeleton(skeleton);
	}
}
