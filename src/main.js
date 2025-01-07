import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(10);
camera.position.setX(50);

// renderer.render(scene, camera);
const ringTexture = new THREE.TextureLoader().load('3DResume/images/rings.png');
const ringNormTexture = new THREE.TextureLoader().load('3DResume/images/rings_normal.jpg');
// const geometry = new THREE.TorusGeometry(10, 4, 16, 1000);
// const material = new THREE.MeshStandardMaterial({color: 0xFF6347});
const torus = new THREE.Mesh(
  new THREE.TorusGeometry(10, 4, 16, 1000),
  new THREE.MeshStandardMaterial({
    map: ringTexture,
    normalMap: ringNormTexture
  })
);
torus.scale.set(1, 1, .05);
torus.rotateX(4/9*Math.PI);
scene.add(torus);

const calebTexture = new THREE.TextureLoader().load('3DResume/images/caleb.jpg');
const caleb = new THREE.Mesh(
  new THREE.BoxGeometry(3, 3, 3),
  new THREE.MeshBasicMaterial({map: calebTexture})
);
scene.add(caleb);

const marsTexture = new THREE.TextureLoader().load('3DResume/images/mars_unwrapped.jpg');
const marsNormalTexture = new THREE.TextureLoader().load('3DResume/images/mars_norm.jpg');
const mars = new THREE.Mesh(
  new THREE.SphereGeometry(3, 32, 32),
  new THREE.MeshStandardMaterial({
    map: marsTexture,
    normalMap: marsNormalTexture
  })
);
scene.add(mars);

const pointLight = new THREE.PointLight(0xFFFFFF, 100);
pointLight.position.set(5, 5, 10);

const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0);
scene.add(pointLight, ambientLight);

// const lightHelper = new THREE.PointLightHelper(pointLight);
// const gridHelper = new THREE.GridHelper(200, 500);
// scene.add(lightHelper, gridHelper);

// renderer.render(scene, camera);

const controls = new OrbitControls(camera, renderer.domElement);

// function addStar() {
//   const geometry = new THREE.SphereGeometry(0.25, 24, 24);
//   const material = new THREE.MeshStandardMaterial({color: 0xFFFFFF});
//   const star = new THREE.Mesh(geometry, material);

//   const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
//   star.position.set(x, y, z);

//   scene.add(star);
// }

// Array(200).fill().forEach(addStar);

const loader = new GLTFLoader();

function addStar() {
  // Load your star model
  loader.load(
    'images/star.glb', // Replace with the actual path to your model file
    function (gltf) {
      const star = gltf.scene;

      // Randomize position
      const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
      star.position.set(x, y, z);

      // Scale the star if needed
      star.scale.set(0.25, 0.25, 0.25); // Adjust the scale to fit your scene

      star.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0xffffff, // Base color
            emissive: 0x444444, // Subtle emissive (glow) effect
            emissiveIntensity: 7, // Adjust intensity as needed
            roughness: 0.9, // Adds shading to the surface
            metalness: 0.5, // Adds slight metallic reflection
          });
        }
      });

      // Add the star model to the scene
      scene.add(star);
    },
    undefined,
    function (error) {
      console.error('An error occurred while loading the star model:', error);
    }
  );
}

// function addStar() {
//   const geometry = new THREE.SphereGeometry(0.25, 24, 24);
//   const material = new THREE.MeshBasicMaterial({color: 0xFFFFFF});
//   const star = new THREE.Mesh(geometry, material);

//   const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
//   star.position.set(x, y, z);

//   scene.add(star);
// }
Array(200).fill().forEach(addStar);

const spaceTexture = new THREE.TextureLoader().load('3DResume/images/earth.jpg');
scene.background = spaceTexture;

caleb.position.z = -10;
mars.position.z = 10;
mars.position.setX(-8);
torus.position.z = 10;
torus.position.setX(-8);

function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  // mars.rotation.x += .05;
  mars.rotation.y += .02;
  torus.rotation.z -= 0.015;
  // mars.rotation.z += .05;

  caleb.rotation.y += .01;
  caleb.rotation.z += .01;
  caleb.position.z = t * .1;
  caleb.position.z = Math.min(caleb.position.z, -10);

  camera.position.z = t * -.01;
  camera.position.x = t * -.002;
  camera.position.y = t * -.002;
  camera.position.z = Math.max(camera.position.z, 1);

}
document.body.onscroll = moveCamera;

function animate() {
  requestAnimationFrame(animate);

  torus.rotation.z -= 0.005;

  mars.rotation.y += 0.005;

  controls.update();

  renderer.render(scene, camera);
}

animate();