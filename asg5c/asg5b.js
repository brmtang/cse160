import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

function main() {

	const canvas = document.querySelector( '#c' );
	const renderer = new THREE.WebGLRenderer( {
		canvas,
		alpha: true,
		antialias: true
	} );
	RectAreaLightUniformsLib.init();

	const fov = 45;
	const aspect = 2; // the canvas default
	const near = 0.1;
	const far = 100;
	const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	camera.position.set( 0, 10, 20 );

	const controls = new OrbitControls( camera, canvas );
	controls.target.set( 0, 5, 0 );
	controls.update();

	const scene = new THREE.Scene();
	{

		const loader2 = new THREE.CubeTextureLoader();
		const texture2 = loader2.load( [
			'px.jpg',
			'nx.jpg',
			'py.jpg',
			'ny.jpg',
			'pz.jpg',
			'nz.jpg',
		] );
		scene.background = texture2;
		
		const planeSize = 40;

		const loader = new THREE.TextureLoader();
		const texture = loader.load( '66416ebef66e8c0453ae5c95a6f022ed4e411cd8_2000x2000.webp' );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.magFilter = THREE.NearestFilter;
		texture.colorSpace = THREE.SRGBColorSpace;
		const repeats = planeSize / 2;
		texture.repeat.set( repeats, repeats );

		const planeGeo = new THREE.PlaneGeometry( planeSize, planeSize );
		const planeMat = new THREE.MeshStandardMaterial( {
			map: texture,
			side: THREE.DoubleSide,
		} );
		const mesh = new THREE.Mesh( planeGeo, planeMat );
		mesh.rotation.x = Math.PI * - .5;
		scene.add( mesh );

	}

	function makeCube( size, colour, x, y, z ) {
		const cubeSize = size;
		const cubeGeo = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );
		const cubeMat = new THREE.MeshStandardMaterial( { color: colour } );
		const mesh = new THREE.Mesh( cubeGeo, cubeMat );
		mesh.position.set(x + 1, y / 2, z);
		scene.add( mesh );
		return mesh;
	}

	function makeSphere(size, colour, x, y, z) {
		const sphereRadius = size;
		const sphereWidthDivisions = 32;
		const sphereHeightDivisions = 16;
		const sphereGeo = new THREE.SphereGeometry( sphereRadius, sphereWidthDivisions, sphereHeightDivisions );
		const sphereMat = new THREE.MeshStandardMaterial( { color: colour } );
		const mesh = new THREE.Mesh( sphereGeo, sphereMat );
		mesh.position.set(x, y, z);
		scene.add( mesh );
		return mesh;
	}

	function makeCone(size, height, segments, colour, x, y, z) {
		const coneRadius = size;
		const coneHeight = height;
		const coneSegments = segments;
		const coneGeo = new THREE.ConeGeometry( coneRadius, coneHeight, coneSegments );
		const coneMat = new THREE.MeshStandardMaterial( { color: colour } );
		const mesh = new THREE.Mesh( coneGeo, coneMat );
		mesh.position.set(x, y, z);
		scene.add( mesh );
		return mesh;
	}

	function makeCylinder(top, bottom, height, segments, colour, x, y, z) {
		const cylinderTop = top;
		const cylinderBottom = bottom;
		const cylinderHeight = height;
		const cylinderSegments = segments;
		const cylinderGeo = new THREE.CylinderGeometry(cylinderTop, cylinderBottom, cylinderHeight, cylinderSegments);
		const cylinderMat = new THREE.MeshStandardMaterial( { color: colour } );
		const mesh = new THREE.Mesh( cylinderGeo, cylinderMat );
		mesh.position.set(x,y,z);
		scene.add(mesh);
		return mesh;
	}

	const shapes = [
		makeCone(5, 5, 4, '#FFFF00', 4, 2.5, 0), // 1
		makeCone(3, 3, 4, '#FFFF00', 9, 1.5, 4.5), // 2
		makeCone(2, 2, 4, '#FFFF00', 9, 1.5, -4.5), // 3
		makeCube(0.5, '#FFFF00', -17, 0.25, 0), // 4
		makeCube(0.5, '#FFFF00', -16, 0.25, 0), // 5
		makeCube(0.5, '#FFFF00', -15, 0.25, 0), // 6
		makeCube(0.5, '#FFFF00', -14, 0.25, 0), // 7
		makeCube(0.5, '#FFFF00', -13, 0.25, 0), // 8
		makeCube(0.5, '#FFFF00', -12, 0.25, 0), // 9
		makeCube(0.5, '#FFFF00', -11, 0.25, 0), // 10
		makeCube(0.5, '#FFFF00', -17, 0.25, 2), // 11
		makeCube(0.5, '#FFFF00', -16, 0.25, 2), // 12
		makeCube(0.5, '#FFFF00', -15, 0.25, 2), // 13
		makeCube(0.5, '#FFFF00', -14, 0.25, 2), // 14
		makeCube(0.5, '#FFFF00', -13, 0.25, 2), // 15
		makeCube(0.5, '#FFFF00', -12, 0.25, 2), // 16
		makeCube(0.5, '#FFFF00', -11, 0.25, 2), // 17
		makeCylinder(0.05, 0.05, 0.7, 10, '#964B00', -15, 0.35, 3), // 18
		makeCylinder(0.05, 0.05, 0.7, 10, '#964B00', -15, 0.35, -2), // 19
		makeSphere(0.2, '#00AA00', -15, 0.7, 3), // 20
		makeSphere(0.2, '#00AA00', -15, 0.7, -2), // 21
	];

	class ColorGUIHelper {

		constructor( object, prop ) {

			this.object = object;
			this.prop = prop;

		}
		get value() {

			return `#${this.object[ this.prop ].getHexString()}`;

		}
		set value( hexString ) {

			this.object[ this.prop ].set( hexString );

		}

	}

	class DegRadHelper {

		constructor( obj, prop ) {

			this.obj = obj;
			this.prop = prop;

		}
		get value() {

			return THREE.MathUtils.radToDeg( this.obj[ this.prop ] );

		}
		set value( v ) {

			this.obj[ this.prop ] = THREE.MathUtils.degToRad( v );

		}

	}

	{

		const color = 0xFFFFFF;
		const intensity = 1;
		const light = new THREE.AmbientLight( color, intensity );
		scene.add( light );

		const gui = new GUI();
		gui.addColor( new ColorGUIHelper( light, 'color' ), 'value' ).name( 'color' );
		gui.add( light, 'intensity', 0, 5, 0.01 );

	}

	{

		const color = 0xFFFFFF;
		const intensity = 1;
		const light = new THREE.DirectionalLight( color, intensity );
		light.position.set( 0, 10, 0 );
		light.target.position.set( - 5, 0, 0 );
		scene.add( light );
		scene.add( light.target );

		const gui = new GUI();
		gui.addColor( new ColorGUIHelper( light, 'color' ), 'value' ).name( 'color' );
		gui.add( light, 'intensity', 0, 5, 0.01 );
		gui.add( light.target.position, 'x', - 10, 10, .01 );
		gui.add( light.target.position, 'z', - 10, 10, .01 );
		gui.add( light.target.position, 'y', 0, 10, .01 );

	}

	function makeXYZGUI( gui, vector3, name, onChangeFn ) {

		const folder = gui.addFolder( name );
		folder.add( vector3, 'x', - 10, 10 ).onChange( onChangeFn );
		folder.add( vector3, 'y', 0, 10 ).onChange( onChangeFn );
		folder.add( vector3, 'z', - 10, 10 ).onChange( onChangeFn );
		folder.open();

	}

	{

		const color = 0xFFFFFF;
		const intensity = 5;
		const width = 12;
		const height = 4;
		const light = new THREE.RectAreaLight( color, intensity, width, height );
		light.position.set( 0, 10, 0 );
		light.rotation.x = THREE.MathUtils.degToRad( - 90 );
		scene.add( light );

		const helper = new RectAreaLightHelper( light );
		light.add( helper );

		const gui = new GUI();
		gui.addColor( new ColorGUIHelper( light, 'color' ), 'value' ).name( 'color' );
		gui.add( light, 'intensity', 0, 10, 0.01 );
		gui.add( light, 'width', 0, 20 );
		gui.add( light, 'height', 0, 20 );
		gui.add( new DegRadHelper( light.rotation, 'x' ), 'value', - 180, 180 ).name( 'x rotation' );
		gui.add( new DegRadHelper( light.rotation, 'y' ), 'value', - 180, 180 ).name( 'y rotation' );
		gui.add( new DegRadHelper( light.rotation, 'z' ), 'value', - 180, 180 ).name( 'z rotation' );

		makeXYZGUI( gui, light.position, 'position' );

	}

	function resizeRendererToDisplaySize( renderer ) {

		const canvas = renderer.domElement;
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		const needResize = canvas.width !== width || canvas.height !== height;
		if ( needResize ) {

			renderer.setSize( width, height, false );

		}

		return needResize;

	}

	function render() {

		if ( resizeRendererToDisplaySize( renderer ) ) {

			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();

		}

		renderer.render( scene, camera );

		requestAnimationFrame( render );

	}

	requestAnimationFrame( render );

}

main();