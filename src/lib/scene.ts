//@ts-nocheck

import {
	Box3,
	DirectionalLight,
	BufferGeometry,
	DoubleSide,
	HemisphereLight,
	Mesh,
	PCFSoftShadowMap,
	PerspectiveCamera,
	Raycaster,
	Scene,
	ShaderLib,
	ShaderMaterial,
	ShadowMaterial,
	SkeletonHelper,
	Sphere,
	Triangle,
	Vector2,
	Vector3,
	WebGLRenderer,
	PlaneGeometry,
	Euler,
} from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import Stats from 'three/addons/libs/stats.module.js';

import { GUI } from 'lil-gui'

import SkinWeightMixin from '/sengine/SkinWeightsShaderMixin.js?url';
import SourceModelLoader from '/sengine/SourceModelLoader.js?url';

import { loadingProgress } from './store'

const LinearEncoding = 3000;

// globals
const params = {
	showSkeleton: false,
	skin: 0,
	selectParentBoneWithChildren: true
};

let camera, scene, renderer, controls, stats;
let directionalLight, ambientLight, ground;
let skeletonHelper, model, skeleton, gui;
let models;
let transformControls;

const mouse = new Vector2();
const mouseDown = new Vector2();
const unselectableBones = [];
let movingControls = false;

const SkinWeightShader = SkinWeightMixin(ShaderLib.phong);
const skinWeightsMaterial = new ShaderMaterial(SkinWeightShader);
skinWeightsMaterial.polygonOffset = true;
skinWeightsMaterial.polygonOffsetFactor = - 1;
skinWeightsMaterial.polygonOffsetUnits = - 1;
skinWeightsMaterial.lights = true;
skinWeightsMaterial.skinning = true;
skinWeightsMaterial.transparent = true;
skinWeightsMaterial.depthWrite = false;
skinWeightsMaterial.uniforms.skinWeightColor.value.set(0xe91e63);
skinWeightsMaterial.uniforms.emissive.value.set(0xe91e63).multiplyScalar(0.5);
skinWeightsMaterial.uniforms.opacity.value = 0.75;
skinWeightsMaterial.uniforms.shininess.value = 0.01;

let loadingId = 0;

const raycastBones = (() => {
	const raycaster = new Raycaster();
	const triangle = new Triangle();
	const baryCoord = new Vector3();
	const getFunctions = ['getX', 'getY', 'getZ', 'getW'];

	return function (mousePos, giveDirectBone = false) {
		if (model && !transformControls.object) {
			raycaster.setFromCamera(mousePos, camera);

			const res = raycaster.intersectObject(model, true);
			if (res.length) {
				const hit = res[0];
				const object = hit.object;
				const geometry = object.geometry;
				const face = hit.face;

				const skinWeightAttr = geometry.getAttribute('skinWeight');
				const skinIndexAttr = geometry.getAttribute('skinIndex');
				const positionAttr = geometry.getAttribute('position');
				const weightTotals = {};

				const aIndex = face.a;
				const bIndex = face.b;
				const cIndex = face.c;

				triangle.a.fromBufferAttribute(positionAttr, aIndex);
				triangle.b.fromBufferAttribute(positionAttr, bIndex);
				triangle.c.fromBufferAttribute(positionAttr, cIndex);

				object.boneTransform(aIndex, triangle.a);
				object.boneTransform(bIndex, triangle.b);
				object.boneTransform(cIndex, triangle.c);

				triangle.a.applyMatrix4(object.matrixWorld);
				triangle.b.applyMatrix4(object.matrixWorld);
				triangle.c.applyMatrix4(object.matrixWorld);

				triangle.getBarycoord(hit.point, baryCoord);

				for (let i = 0; i < skinIndexAttr.itemSize; i++) {
					const func = getFunctions[i];

					const aWeightIndex = skinIndexAttr[func](aIndex);
					const bWeightIndex = skinIndexAttr[func](bIndex);
					const cWeightIndex = skinIndexAttr[func](cIndex);

					const aWeight = skinWeightAttr[func](aIndex);
					const bWeight = skinWeightAttr[func](bIndex);
					const cWeight = skinWeightAttr[func](cIndex);

					weightTotals[aWeightIndex] = weightTotals[aWeightIndex] || 0;
					weightTotals[bWeightIndex] = weightTotals[bWeightIndex] || 0;
					weightTotals[cWeightIndex] = weightTotals[cWeightIndex] || 0;

					weightTotals[aWeightIndex] += aWeight * baryCoord.x;
					weightTotals[bWeightIndex] += bWeight * baryCoord.y;
					weightTotals[cWeightIndex] += cWeight * baryCoord.z;
				}

				const sorted =
					Object
						.entries(weightTotals)
						.map(([key, value]) => ({ weight: value, index: key }))
						.sort((a, b) => b.weight - a.weight);

				const boneIndex = sorted[0].index;
				let bone = skeleton.bones[boneIndex];
				const parentIndex = skeleton.bones.findIndex(b => b === bone.parent);

				// TODO: this should check if the parent bone isn't clickable through any other means
				// then we should bump to the parent.
				if (
					params.selectParentBoneWithChildren &&
					unselectableBones.includes(parentIndex) &&
					bone.children.length === 0 &&
					bone.parent.children.length > 1 &&
					!giveDirectBone
				) {
					bone = bone.parent;
				}

				return bone;
			} else {
				return null;
			}

		}

		return null;
	};
})();

function loadModel(path) {
	if (model) {
		model.traverse(c => {
			if (c.material) {
				c.material.dispose();
				for (const key in c.material) {
					if (c.material[key] && c.material[key].isTexture)
						c.material[key].dispose();
				}
			}

			if (c.geometry)
				c.geometry.dispose();
			if (c.skeleton)
				c.skeleton.dispose();
		});

		model.parent.remove(model);
		skeletonHelper.parent.remove(skeletonHelper);

		scene.remove(model);

		model = null;
		skeletonHelper = null;
		skeleton = null;
	}

	params.model = path;

	loadingId++;
	const myLoadingId = loadingId;
	loadingProgress.set(0);

	if (!path.includes("assets"))
		path = "assets//" + path

	new SourceModelLoader()
		.load(`${path}`, ({ group, vvd, vtx, mdl }) => {
			if (loadingId !== myLoadingId) return;

			window.vvd = vvd;
			window.vtx = vtx;
			window.mdl = mdl;
			window.group = group;

			group.traverse(c => {
				if (c.isSkinnedMesh) {
					// Find the bone indices that are unreferenced in the model
					const getFunctions = ['getX', 'getY', 'getZ', 'getW'];
					const geometry = c.geometry;
					const skinWeightAttr = geometry.getAttribute('skinWeight');
					const skinIndexAttr = geometry.getAttribute('skinIndex');
					const weightMap = [];
					let overallTotalWeight = 0;

					for (let i = 0, l = skinWeightAttr.count; i < l; i++) {
						let maxWeight = 0;
						let maxIndex = - 1;

						for (let j = 0, jl = skinIndexAttr.itemSize; j < jl; j++) {
							const func = getFunctions[j];
							const weightIndex = skinIndexAttr[func](i);
							const weight = skinWeightAttr[func](i);

							if (weight > maxWeight) {
								maxWeight = weight;
								maxIndex = weightIndex;
							}
						}

						let weightInfo = weightMap[maxIndex];
						if (!weightInfo) {
							weightInfo = { totalCount: 0, totalWeight: 0 };
							weightMap[maxIndex] = weightInfo;
						}

						weightInfo.totalCount++;
						weightInfo.totalWeight += maxWeight;
						overallTotalWeight += maxWeight;
					}

					const mappedWeights = weightMap.map(info => info ? info.totalWeight / overallTotalWeight : 0);
					for (let i = 0; i < mappedWeights.length; i++) {
						if (!mappedWeights[i])
							unselectableBones.push(i);
					}
				}
			});

			skeletonHelper = new SkeletonHelper(group);
			scene.add(skeletonHelper);
			scene.add(group);

			group.traverse(c => {
				if (c.isMesh) {
					c.castShadow = true;
					c.receiveShadow = true;
				}

				if (c.isSkinnedMesh)
					skeleton = c.skeleton;
			});

			const bb = new Box3();
			bb.setFromObject(group);

			const sphere = new Sphere();
			bb.getBoundingSphere(sphere);

			group.scale.multiplyScalar(20 / sphere.radius);

			const dim = new Vector3().subVectors(bb.max, bb.min);
			if (dim.z > dim.y)
				group.rotation.x = - Math.PI / 2;

			bb.setFromObject(group).getCenter(group.position).multiplyScalar(- 1);
			bb.setFromObject(group);

			bb.getCenter(directionalLight.position);
			directionalLight.position.x += 20;
			directionalLight.position.y += 30;
			directionalLight.position.z += 20;

			ground.position.y = bb.min.y;

			const cam = directionalLight.shadow.camera;
			cam.left = cam.bottom = -20;
			cam.right = cam.top = 20;
			cam.updateProjectionMatrix();

			// Expand the bounding volumes by a ton so that parts can't be dragged outside the
			// raycast volume.
			group.traverse(c => {
				if (c.isSkinnedMesh) {
					if (!c.geometry.boundingBox) c.geometry.computeBoundingBox();
					c.geometry.boundingBox.min.multiplyScalar(1000);
					c.geometry.boundingBox.max.multiplyScalar(1000);

					if (!c.geometry.boundingSphere) c.geometry.computeBoundingSphere();
					c.geometry.boundingSphere.radius *= 1000;
				}
			});

			model = group;
			rebuildGui(models)
		}, (xhr) => {
			loadingProgress.set(xhr.loaded / xhr.total * 100)
		});
}

function init(el) {
	renderer = new WebGLRenderer({ antialias: true, canvas: el });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(0x0d1113);
	renderer.outputEncoding = LinearEncoding;
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = PCFSoftShadowMap;
	document.body.appendChild(renderer.domElement);

	stats = Stats();
	document.body.appendChild(stats.domElement);

	camera = new PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 6000);
	camera.position.set(20, 20, 60);

	scene = new Scene();

	directionalLight = new DirectionalLight(0xFFF8E1, 1.0);
	directionalLight.position.set(1, 3, - 2).multiplyScalar(100);
	directionalLight.castShadow = true;
	directionalLight.shadow.mapSize.setScalar(1024);

	const dlShadowCam = directionalLight.shadow.camera;
	dlShadowCam.left = dlShadowCam.bottom = - 100;
	dlShadowCam.top = dlShadowCam.right = 100;
	scene.add(directionalLight);

	ambientLight = new HemisphereLight(0xE0F7FA, 0x8D6E63, 0.45);
	scene.add(ambientLight);

	ground = new Mesh(new PlaneGeometry());
	ground.material = new ShadowMaterial({ side: DoubleSide, opacity: 0.5, transparent: true, depthWrite: false });
	ground.receiveShadow = true;
	ground.scale.multiplyScalar(1000);
	ground.rotation.x = - Math.PI / 2;
	scene.add(ground);

	loadModel(`assets/models/combine_camera/combine_camera`);

	renderer.domElement.addEventListener('pointermove', onMouseMove, false);
	renderer.domElement.addEventListener('pointerdown', onMouseDown, false);
	renderer.domElement.addEventListener('pointerup', onMouseUp, false);

	controls = new OrbitControls(camera, renderer.domElement);
	controls.addEventListener('start', () => movingControls = true);
	controls.addEventListener('end', () => movingControls = false);
	controls.minDistance = 5;
	controls.maxDistance = 3000;

	transformControls = new TransformControls(camera, renderer.domElement);
	transformControls.mode = 'rotate';
	transformControls.space = 'local';
	transformControls.size = 0.75;
	transformControls.addEventListener('dragging-changed', e => {
		controls.enabled = !e.value;
		movingControls = false;
	});
	scene.add(transformControls);

	window.addEventListener('beforeunload', onBeforeUnload)
	window.addEventListener('resize', onWindowResize, false);
	window.addEventListener('keydown', e => {
		switch (e.key) {
			case 'w':
				transformControls.mode = 'translate';
				break;
			case 'e':
				transformControls.mode = 'rotate';
				break;
			case 'r':
				transformControls.mode = 'scale';
				break;
		}
	});

}

function rebuildGui(models) {
	if (gui)
		gui.destroy();

	params.skin = 0;

	gui = new GUI();
	gui.width = 400;

	const main = gui.addFolder("Main");
	main.add(params, 'model', models).onChange(loadModel).name("Model List");

	const visual = gui.addFolder("Visual");
	visual.add(params, 'showSkeleton').name("Show Skeleton");
	visual.add(params, 'selectParentBoneWithChildren').name("Select Parent Bone with Children");

	const info = gui.addFolder("Info")
	info.add({ func: async () => { await navigator.clipboard.writeText(params.model) } }, "func").name("Copy Model's Path")

	if (model && model.userData.skinsTable.length > 1) {
		const options = {};
		model.userData.skinsTable.forEach((_, i) => options[`Skin ${i}`] = i);

		main.add(params, 'skin').options(options).name("Skin List");
	}

	gui.open();
}

function onBeforeUnload() {
	renderer.dispose();
}

function onWindowResize() {
	const width = window.innerWidth;
	const height = window.innerHeight;

	camera.aspect = width / height;
	camera.updateProjectionMatrix();

	renderer.setSize(width, height);
}

function onMouseMove(e) {
	mouse.x = (e.clientX / renderer.domElement.clientWidth) * 2 - 1;
	mouse.y = - (e.clientY / renderer.domElement.clientHeight) * 2 + 1;
}

function onMouseDown(e) {
	onMouseMove(e);
	mouseDown.copy(mouse);
}

function onMouseUp(e) {
	onMouseMove(e);
	if (mouseDown.distanceTo(mouse) < 0.001) {
		const hitBone = raycastBones(mouse, e.which !== 1);

		if (hitBone) {
			transformControls.attach(hitBone);
		} else {
			transformControls.detach();
			raycastBones(mouse);
		}
	}
}

function animate() {
	requestAnimationFrame(animate);
	render();
	stats.update();
}

function render() {
	if (skeletonHelper)
		skeletonHelper.visible = params.showSkeleton;

	if (model) {
		const skinsTable = model.userData.skinsTable;
		const materials = model.userData.materials;

		model.traverse(c => {
			if (c.isMesh)
				c.material = materials[skinsTable[params.skin][c.userData.materialIndex]];
		});

		if (transformControls.object) {
			skinWeightsMaterial.uniforms.skinWeightIndex.value = skeleton.bones.indexOf(transformControls.object);
		} else {
			skinWeightsMaterial.uniforms.skinWeightIndex.value = - 1;
		}
	}

	controls.update();
	renderer.render(scene, camera);

	if (!movingControls) {
		const bone = raycastBones(mouse);
		if (bone)
			skinWeightsMaterial.uniforms.skinWeightIndex.value = skeleton.bones.indexOf(bone);
	}

	if (model) {
		model.traverse(c => {
			if (c.isMesh)
				c.material = skinWeightsMaterial;
		});

		renderer.autoClear = false;
		renderer.render(scene, camera);
		renderer.autoClear = true;
	}
}

export const createScene = (dCanvas, dModels) => {
	models = dModels;

	init(dCanvas)
	rebuildGui(dModels)
	animate()
}