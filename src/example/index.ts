import {Skeleton, SkeletonBuilder} from '../wrapper';
import {isPolygon} from "geojson-validation";
import earcut from "earcut";
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

const samples: GeoJSON.Polygon[] = [{
	type: "Polygon",
	coordinates: [[[312.3870017063487, 376.0326225026391], [312.3870017063487, 371.10594198945313], [304.43713087825324, 371.10594198945313], [304.47445421547434, 376.0326225026391], [292.53098630472056, 376.06994583986017], [292.49366296749946, 371.70311538499084], [275.92210124132856, 371.74043872221193], [259.98503624791647, 371.8150853966541], [259.98503624791647, 376.368532537629], [254.1252723042029, 376.368532537629], [254.1252723042029, 378.83187279422197], [254.1252723042029, 380.95930301582496], [252.48304546647427, 380.99662635304605], [245.54090474334862, 380.99662635304605], [238.8227040435496, 380.99662635304605], [237.81497393857978, 380.99662635304605], [237.81497393857978, 376.5551492237345], [231.9925333320873, 376.59247256095557], [231.9552099948662, 361.2899043003023], [233.56011349537374, 361.2899043003023], [233.56011349537374, 342.36697232920176], [232.0298566693084, 342.36697232920176], [232.0298566693084, 338.0374652115535], [223.5947824573385, 338.0374652115535], [223.5947824573385, 333.59598808224194], [222.43775900348425, 333.59598808224194], [222.47508234070534, 324.8996505097243], [222.47508234070534, 317.69624642605095], [223.44548910845407, 317.69624642605095], [223.44548910845407, 313.105475947855], [231.91788665764506, 313.1427992850761], [231.91788665764506, 307.9548554113424], [232.92561676261488, 307.9548554113424], [233.00026343705707, 290.1143002196539], [231.54465328543398, 290.1143002196539], [231.61929995987617, 273.9159718656941], [236.99386051971538, 273.95329520291517], [237.03118385693648, 268.91464467806594], [238.78538070632845, 268.91464467806594], [245.6528747550119, 268.95196801528704], [253.08021886201192, 268.98929135250813], [254.31188899030838, 268.95196801528704], [254.31188899030838, 269.4371713991614], [254.27456565308728, 274.7744086217795], [260.13432959680085, 274.8117319590006], [260.13432959680085, 277.08845552948804], [275.8101312296652, 277.12577886670914], [291.7471962230773, 277.16310220393024], [291.7471962230773, 274.40117524956844], [302.9068740521879, 274.43849858678954], [302.9068740521879, 282.0524593798951], [312.9468517646653, 282.0897827171162], [312.9468517646653, 275.44622869175936], [325.74875643150455, 275.44622869175936], [337.91616436558496, 275.48355202898045], [337.91616436558496, 282.1271060543373], [347.73220205473575, 282.1644293915584], [347.73220205473575, 275.48355202898045], [357.2123297088966, 275.48355202898045], [357.2123297088966, 279.1039157394277], [374.2317714817208, 279.1039157394277], [387.3695861835499, 279.0665924022066], [387.3695861835499, 271.9751583301965], [395.8046603955198, 271.9378349929754], [395.8046603955198, 268.4667646314126], [404.7249379913641, 268.4667646314126], [411.92834207503745, 268.4667646314126], [411.92834207503745, 272.08712834185985], [419.99018291479626, 272.04980500463876], [420.06482958923846, 309.5597589118499], [420.10215292645955, 312.69491923842276], [423.2373132530324, 312.69491923842276], [423.2746365902535, 325.31020721915644], [423.2746365902535, 338.48534525820673], [419.50497953092184, 338.52266859542783], [419.46765619370075, 340.76206882869417], [419.50497953092184, 375.7713591420912], [411.9283420750374, 375.8086824793123], [412.00298874947964, 379.50369286420175], [412.00298874947964, 380.5860696436138], [404.4636746308163, 380.5860696436138], [397.4095638960273, 380.5860696436138], [397.3722405588062, 375.696712467649], [391.10191990566045, 375.696712467649], [391.10191990566045, 370.35947524503086], [374.2317714817208, 370.39679858225196], [370.08888105017803, 370.43412191947306], [357.6602097555499, 370.50876859391525], [357.697533092771, 375.13686240933237], [346.94841197309256, 375.17418574655346], [346.94841197309256, 371.14326532667405], [338.28939773779604, 371.18058866389515], [338.28939773779604, 375.88332915375446], [337.9534877028061, 375.88332915375446], [337.8415176911428, 378.1227293870208], [337.8415176911428, 379.69030955030723], [332.243017107977, 379.69030955030723], [325.30087638485134, 379.8396028991917], [317.052418858987, 379.87692623641277], [313.6559951718664, 379.91424957363387], [313.6559951718664, 377.5255559914831], [313.6559951718664, 376.03262250263884], [312.3870017063487, 376.0326225026391]], [[338.06545771446946, 305.56616182919146], [338.3640444122383, 345.0542526091212], [374.4930348422685, 344.86763592301565], [391.99767999896704, 344.83031258579456], [391.8110633128615, 305.93939520140253], [374.1944481444997, 305.86474852696034], [338.06545771446946, 305.56616182919146]], [[259.2012461662733, 344.8303125857946], [312.3496783691277, 344.7556659113524], [312.38700170634877, 305.9393952014026], [259.2012461662733, 305.9020718641815], [259.2012461662733, 344.8303125857946]]]
}, {
	type: "Polygon",
	coordinates: [[[9.594226, 47.525058], [8.522612, 47.830828], [8.317301, 47.61358], [7.466759, 47.620582], [7.192202, 47.449766], [6.736571, 47.541801], [6.768714, 47.287708], [6.037389, 46.725779], [6.022609, 46.27299], [6.5001, 46.429673], [6.843593, 45.991147], [7.273851, 45.776948], [7.755992, 45.82449], [8.31663, 46.163642], [8.489952, 46.005151], [8.966306, 46.036932], [9.182882, 46.440215], [9.922837, 46.314899], [10.363378, 46.483571], [10.442701, 46.893546], [9.932448, 46.920728], [9.47997, 47.10281], [9.632932, 47.347601], [9.594226, 47.525058]]]
}, {
	type: "Polygon",
	coordinates: [[[417.3775493093188, 476.76830966240306], [472.1682083499018, 542.5693531832122], [466.38309108063044, 555.6698445478203], [470.5259815121732, 557.8345981066444], [448.76647591226856, 610.6471202745089], [444.5116154690626, 609.0795401112225], [438.9131148858967, 622.6652348597049], [341.835114773801, 597.9198622821119], [340.3048579477357, 597.8452156076697], [340.4541512966201, 596.4269287932677], [337.8415176911427, 586.4242744180115], [337.02040427227837, 585.9763943713582], [335.63944079509747, 580.0793070904235], [334.1838306434744, 578.3997569154737], [332.24301710797687, 571.1217061573582], [332.4296337940824, 568.3597792029964], [330.86205363079597, 562.9852186431572], [331.23528700300704, 561.9774885381873], [328.47336004864525, 551.6762474651622], [327.6149232925598, 550.7431640346346], [328.51068338586634, 550.1086673018758], [380.16618209987655, 498.60246193675005], [417.3775493093188, 476.76830966240306]], [[384.23442585697705, 555.0726711522829], [367.73751080524835, 538.6504027749963], [358.443999837193, 547.719973719725], [367.961450828575, 584.3714908708507], [380.6513854837509, 587.2827111740969], [386.8097361252333, 563.9556254109059], [385.83932935748453, 562.3507219103983], [384.6823059036303, 560.2232916887953], [384.30907253141925, 556.6775746527902], [384.23442585697705, 555.0726711522829]], [[425.43939014907767, 518.1225673033881], [417.34022597209776, 508.49314630034286], [401.7763943508967, 517.1894838728605], [406.7403982013037, 520.4366142110966], [402.97074114197204, 526.2590548175891], [405.9192847824394, 528.31183836475], [400.134167513168, 534.8434223784435], [400.95528093203234, 535.4405957739812], [394.05046354612773, 542.5320298459912], [413.0107188544494, 550.3699306624234], [425.43939014907767, 518.1225673033881]], [[434.88219446601727, 582.2067373120265], [450.48334942443944, 544.9953701025842], [441.1151917819419, 541.3003597176947], [423.05069656692683, 584.9313409291672], [411.0325819817308, 579.930013741539], [406.7030748640825, 596.4642521304888], [415.0635024016102, 599.6367357942828], [417.0416392743288, 595.120611990529], [424.39433670688663, 598.1438023054386], [425.924593532952, 594.4114685833281], [429.1344005339671, 595.7177853860668], [433.68784767494196, 584.483460882514], [432.0456208372133, 583.774317475313], [433.1279976166254, 581.4602705676044], [434.88219446601727, 582.2067373120265]]]
}];

let activeSkeleton: Skeleton = null;
let skeletonBox: {minX: number, minY: number, maxX: number, maxY: number} = null;

const updateSkeletonBox = () => {
	if (activeSkeleton === null) {
		skeletonBox = null;
		return;
	}

	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;

	for (const vertex of activeSkeleton.vertices) {
		minX = Math.min(minX, vertex[0]);
		minY = Math.min(minY, vertex[1]);
		maxX = Math.max(maxX, vertex[0]);
		maxY = Math.max(maxY, vertex[1]);
	}

	skeletonBox = {minX, minY, maxX, maxY};
};

SkeletonBuilder.init().then(() => {
	// 2D canvas

	const canvas2d = document.getElementById('canvas2d') as HTMLCanvasElement;
	const ctx = canvas2d.getContext('2d');

	const draw2d = () => {
		ctx.fillStyle = '#eee';
		ctx.fillRect(0, 0, canvas2d.width, canvas2d.height);

		if (activeSkeleton === null) {
			return;
		}

		const padding = 15 * window.devicePixelRatio;
		const scale = Math.min(
			(canvas2d.width - padding * 2) / (skeletonBox.maxX - skeletonBox.minX),
			(canvas2d.height - padding * 2) / (skeletonBox.maxY - skeletonBox.minY)
		);
		const offsetX = (canvas2d.width - (skeletonBox.maxX - skeletonBox.minX) * scale) / 2;
		const offsetY = (canvas2d.height - (skeletonBox.maxY - skeletonBox.minY) * scale) / 2;

		ctx.strokeStyle = '#000';
		ctx.lineWidth = window.devicePixelRatio;
		ctx.fillStyle = '#ffb6e9';

		for (const polygon of activeSkeleton.polygons) {
			ctx.beginPath();

			for (let i = 0; i < polygon.length; i++) {
				const vertex = activeSkeleton.vertices[polygon[i]];
				const x = (vertex[0] - skeletonBox.minX) * scale + offsetX;
				const y = (vertex[1] - skeletonBox.minY) * scale + offsetY;

				if (i === 0) {
					ctx.moveTo(x, y);
				} else {
					ctx.lineTo(x, y);
				}
			}

			ctx.closePath();
			ctx.stroke();
			ctx.fill();
		}
	};

	const onCanvas2dResize = () => {
		canvas2d.width = canvas2d.clientWidth * window.devicePixelRatio;
		canvas2d.height = canvas2d.clientHeight * window.devicePixelRatio;
		draw2d();
	};

	new ResizeObserver(onCanvas2dResize).observe(canvas2d);

	// 3D canvas

	const canvas3d = document.getElementById('canvas3d') as HTMLCanvasElement;

	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0xeeeeee);
	const camera = new THREE.PerspectiveCamera(25, canvas3d.clientWidth / canvas3d.clientHeight, 0.01, 100);
	const renderer = new THREE.WebGLRenderer({
		canvas: canvas3d,
		antialias: true
	});
	const controls = new OrbitControls(camera, renderer.domElement);
	const light = new THREE.DirectionalLight(0xffffff, 0.5);
	light.position.set(1, 1, -0.5);
	scene.add(light);
	scene.add(new THREE.AmbientLight(0xffffff, 0.5));

	camera.position.set(1, 2, 1);
	controls.update();

	const onCanvas3dResize = () => {
		canvas3d.width = canvas3d.clientWidth * window.devicePixelRatio;
		canvas3d.height = canvas3d.clientHeight * window.devicePixelRatio;

		renderer.setViewport(0, 0, canvas3d.width, canvas3d.height);
		camera.aspect = canvas3d.clientWidth / canvas3d.clientHeight;
		camera.updateProjectionMatrix();
	};

	new ResizeObserver(onCanvas3dResize).observe(canvas3d);

	const material = new THREE.MeshPhysicalMaterial({
		color: new THREE.Color(0xffb6e9),
		side: THREE.DoubleSide,
		flatShading: true
	});
	const parent = new THREE.Object3D();
	scene.add(parent);

	const animate = () => {
		requestAnimationFrame(animate);
		controls.update();
		renderer.render(scene, camera);
	};
	animate();

	const draw3d = () => {
		parent.remove(...parent.children);

		if (activeSkeleton === null) {
			return;
		}

		const offset = new THREE.Vector3(
			-(skeletonBox.maxX + skeletonBox.minX) / 2,
			-(skeletonBox.maxY + skeletonBox.minY) / 2,
			0
		);
		const scale = 1 / Math.max(skeletonBox.maxX - skeletonBox.minX, skeletonBox.maxY - skeletonBox.minY);

		const geometry = new THREE.BufferGeometry();
		const vertices: number[] = [];

		for (const polygon of activeSkeleton.polygons) {
			const polygonVertices: number[] = [];

			for (let i = 0; i < polygon.length; i++) {
				const vertex = activeSkeleton.vertices[polygon[i]];
				polygonVertices.push(
					(vertex[0] + offset.x) * scale,
					(vertex[1] + offset.y) * scale,
					(vertex[2] + offset.z) * scale
				);
			}

			const triangles = earcut(polygonVertices, null, 3);

			for (let i = 0; i < triangles.length / 3; i++) {
				for (let j = 0; j < 3; j++) {
					const index = triangles[i * 3 + j];

					vertices.push(polygonVertices[index * 3], polygonVertices[index * 3 + 1], polygonVertices[index * 3 + 2]);
				}
			}
		}

		geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));

		const mesh = new THREE.Mesh(geometry, material);
		mesh.rotation.x = -Math.PI / 2;
		parent.add(mesh);

		camera.position.set(1, 2, 1);
		controls.update();
	};

	// DOM events

	const updateButton = document.getElementById('update');

	updateButton.addEventListener('click', () => {
		let inputJSON: any;

		try {
			inputJSON = JSON.parse((<HTMLTextAreaElement>document.getElementById('input')).value);
		} catch (e) {
			alert(`Invalid JSON: ${e.message}`);
			console.error(e);
			return;
		}

		const isValid = isPolygon(inputJSON);

		if (!isValid) {
			alert('Invalid GeoJSON polygon');
			return;
		}

		let skeleton: Skeleton;
		const startTime = performance.now();

		try {
			skeleton = SkeletonBuilder.buildFromGeoJSONPolygon(inputJSON);
		} catch (e) {
			alert(`Wasm module threw an error: ${e.message}`);
			console.error(e);
			return;
		}

		if (skeleton === null) {
			alert('Wasm module returned null');
			return;
		}

		const endTime = performance.now();

		document.getElementById('time').innerHTML = `${(endTime - startTime).toFixed(2)} ms`;

		activeSkeleton = skeleton;
		updateSkeletonBox();
		draw2d();
		draw3d();
	});

	const sampleButtons = document.getElementsByClassName('sample');

	for (let i = 0; i < sampleButtons.length; i++) {
		sampleButtons[i].addEventListener('click', () => {
			const id = sampleButtons[i].getAttribute('data-sample');
			const input = JSON.stringify(samples[parseInt(id)], null, 4);

			(<HTMLTextAreaElement>document.getElementById('input')).value = input;

			updateButton.click();
		});
	}

	(sampleButtons[0] as HTMLButtonElement).click();
});
