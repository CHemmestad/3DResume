import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(1);
camera.position.setY(0);
camera.position.setX(0);

const spaceTexture = new THREE.TextureLoader().load('https://raw.githubusercontent.com/CHemmestad/3DResume/main/public/images/earth.jpg');
const backgroundGeometry = new THREE.PlaneGeometry(370, 200);
const backgroundMaterial = new THREE.MeshBasicMaterial({
  map: spaceTexture,
  depthTest: false
});
const backgroundMesh = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
backgroundMesh.material.side = THREE.DoubleSide;
backgroundMesh.position.z = -100;
backgroundMesh.position.x = -20;
backgroundMesh.position.y = -20;
scene.add(backgroundMesh);

const calebTexture = new THREE.TextureLoader().load('https://raw.githubusercontent.com/CHemmestad/3DResume/main/public/images/caleb.jpg');
const caleb = new THREE.Mesh(
  new THREE.BoxGeometry(3, 3, 3),
  new THREE.MeshBasicMaterial({ map: calebTexture })
);
scene.add(caleb);

// renderer.render(scene, camera);
const ringTexture = new THREE.TextureLoader().load('https://raw.githubusercontent.com/CHemmestad/3DResume/main/public/images/rings.png');
const ringNormTexture = new THREE.TextureLoader().load('https://raw.githubusercontent.com/CHemmestad/3DResume/main/public/images/rings_normal.jpg');
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
torus.rotateX(4 / 9 * Math.PI);
scene.add(torus);

const marsTexture = new THREE.TextureLoader().load('https://raw.githubusercontent.com/CHemmestad/3DResume/main/public/images/mars_unwrapped.jpg');
const marsNormalTexture = new THREE.TextureLoader().load('https://raw.githubusercontent.com/CHemmestad/3DResume/main/public/images/mars_norm.jpg');
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
    'https://raw.githubusercontent.com/CHemmestad/3DResume/main/public/images/star2.glb', // Replace with the actual path to your model file
    function (gltf) {
      const star = gltf.scene;

      // Randomize position
      const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));

      let area = 3.5;
      if (Math.abs(x) > area && Math.abs(y) > area) {
        star.position.set(x, y, z);

        const randomScale = THREE.MathUtils.randFloat(0.05, 0.225);
        star.scale.set(randomScale, randomScale, randomScale);

        star.traverse((child) => {
          if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
              color: 0xffcc00, // Yellowish color (not too bright)
              emissive: 0xcccc00, // Subtle emissive (glow) effect (yellowish glow)
              emissiveIntensity: 0.1, // Reduced intensity for a more subtle glow
              roughness: 0.5, // Some roughness to add shading to the surface
              metalness: 0, // No metallic reflection
            });
          }
        });

        // Add the star model to the scene
        scene.add(star);
      }
    },
    undefined,
    function (error) {
      console.error('An error occurred while loading the star model:', error);
    }
  );
}
Array(1000).fill().forEach(addStar);

const mtlLoader = new MTLLoader();
const objLoader = new OBJLoader();

mtlLoader.load('https://raw.githubusercontent.com/CHemmestad/3DResume/main/public/images/shuttle.mtl', function (materials) {
  materials.preload();

  objLoader.setMaterials(materials);
  objLoader.load('https://raw.githubusercontent.com/CHemmestad/3DResume/main/public/images/shuttle.obj', function (object) {
    object.position.z = 10;
    object.position.y = 1;
    object.rotateX(-1/12*Math.PI);
    object.rotateY(1/12*Math.PI);
    object.rotateZ(-1/10*Math.PI);
    scene.add(object);
  });
});

let thanks;
loader.load('public/images/thanks.glb',
  function (gltf) {
    thanks = gltf.scene;
    scene.add(thanks);
  },
  function (xhr) {},
  function (error) {}
);


// const marsTexture = new THREE.TextureLoader().load('https://raw.githubusercontent.com/CHemmestad/3DResume/main/public/images/mars_unwrapped.jpg');
// const marsNormalTexture = new THREE.TextureLoader().load('https://raw.githubusercontent.com/CHemmestad/3DResume/main/public/images/mars_norm.jpg');
// const mars = new THREE.Mesh(
//   new THREE.SphereGeometry(3, 32, 32),
//   new THREE.MeshStandardMaterial({
//     map: marsTexture,
//     normalMap: marsNormalTexture
//   })
// );
// scene.add(mars);


// loader.load(
//   'images/spaceshuttle.glb', // Replace with the actual path to your model file
//   function (gltf) {
//     const shuttle = gltf.scene;
//     shuttle.position.z = 10;
//     shuttle.position.y = 1;
//     scene.add(shuttle);
//   },
//   undefined,
//   function (error) {
//     console.error('An error occurred while loading the star model:', error);
//   }
// );

// const spaceTexture = new THREE.TextureLoader().load('https://raw.githubusercontent.com/CHemmestad/3DResume/main/public/images/earth.jpg');
// scene.background = spaceTexture;

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
  caleb.position.z = t * .2;
  caleb.position.z = Math.min(caleb.position.z, -8);

  // backgroundMesh.position.z = Math.min(backgroundMesh.position.z, -100);
  backgroundMesh.position.z = t * .1 + -100;

  camera.position.z = t * -.01;
  camera.position.x = t * -.002;
  camera.position.y = t * -.002;
  camera.position.z = Math.max(camera.position.z, 1);

}
document.body.onscroll = moveCamera;

function animate() {
  requestAnimationFrame(animate);

  torus.rotation.z -= 0.005;

  controls.update();

  renderer.render(scene, camera);
}
animate();