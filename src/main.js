import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
// import Thanks from '/public/images/thanks.glb';

const contactForm = document.querySelector('#contactForm');
const contactSubmit = document.querySelector('#contactSubmit');
const contactModalBody = document.querySelector('#contactModalBody');
const contactEndpoint = import.meta.env.VITE_CONTACT_ENDPOINT || '/api/contact';
const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
const turnstileAction = 'contact';
let contactTurnstileWidgetId = null;

renderContactTurnstile();
const turnstileRenderTimer = window.setInterval(() => {
  if (contactTurnstileWidgetId !== null || window.turnstile) {
    window.clearInterval(turnstileRenderTimer);
  }

  renderContactTurnstile();
}, 250);

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      contactForm.classList.add('was-validated');
      return;
    }

    const formData = new FormData(contactForm);
    const turnstileToken = formData.get('cf-turnstile-response')?.trim();

    if (!turnstileToken) {
      setContactStatus('Please complete the verification check before sending.');
      showContactModal();
      return;
    }

    const payload = {
      name: formData.get('name')?.trim(),
      email: formData.get('email')?.trim(),
      subject: formData.get('subject')?.trim(),
      message: formData.get('message')?.trim(),
      website: formData.get('website')?.trim(),
      turnstileToken,
    };

    setContactStatus('Sending message...');
    setContactSubmitDisabled(true);

    try {
      const response = await fetch(contactEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || 'Message failed to send.');
      }

      contactForm.reset();
      contactForm.classList.remove('was-validated');
      setContactStatus('Message sent. Thanks for reaching out!');
    } catch (error) {
      setContactStatus(error.message || 'Message failed to send. Please try again later.');
    } finally {
      setContactSubmitDisabled(false);
      resetTurnstile();
      showContactModal();
    }
  });
}

function renderContactTurnstile() {
  const container = document.querySelector('#contactTurnstile');
  if (!container || !window.turnstile || !turnstileSiteKey || contactTurnstileWidgetId !== null) {
    return;
  }

  contactTurnstileWidgetId = window.turnstile.render(container, {
    sitekey: turnstileSiteKey,
    action: turnstileAction,
  });
}

function setContactStatus(message) {
  if (contactModalBody) {
    contactModalBody.textContent = message;
  }
}

function setContactSubmitDisabled(isDisabled) {
  if (contactSubmit) {
    contactSubmit.disabled = isDisabled;
  }
}

function showContactModal() {
  const modalElement = document.querySelector('#exampleModal');
  if (modalElement && window.bootstrap) {
    window.bootstrap.Modal.getOrCreateInstance(modalElement).show();
  }
}

function resetTurnstile() {
  if (window.turnstile && contactTurnstileWidgetId !== null) {
    window.turnstile.reset(contactTurnstileWidgetId);
  }
}

const assetPath = (path) => `${import.meta.env.BASE_URL}${path}`;

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

const spaceTexture = new THREE.TextureLoader().load(assetPath('images/earth.jpg'));
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

const calebTexture = new THREE.TextureLoader().load(assetPath('images/caleb.jpg'));
const caleb = new THREE.Mesh(
  new THREE.BoxGeometry(3, 3, 3),
  new THREE.MeshBasicMaterial({ map: calebTexture })
);
scene.add(caleb);

const loader = new GLTFLoader();
const mars = new THREE.Group();
scene.add(mars);

loader.load(assetPath('images/the_moon.glb'), (gltf) => {
  const moon = gltf.scene;

  moon.scale.set(8, 8, 8);
  mars.add(moon);
});

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

const stars = [];

function addStar() {
  // Load your star model
  loader.load(assetPath('images/star3.glb'), (gltf) => {

  // loader.load(
  //   'https://raw.githubusercontent.com/CHemmestad/3DResume/main/public/images/star3.glb', // Replace with the actual path to your model file
  //   function (gltf) {
      const star = gltf.scene;

      // Randomize position
      const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));

      let area = 3.5;
      if (Math.abs(x) > area && Math.abs(y) > area) {
        star.position.set(x, y, z);

        const randomScale = THREE.MathUtils.randFloat(0.05, 0.5);
        star.scale.set(randomScale, randomScale, randomScale);

        star.traverse((child) => {
          if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
              // color: 0xffcc00, // Yellowish color (not too bright)
              emissive: 0xcccc00, // Subtle emissive (glow) effect (yellowish glow)
              emissiveIntensity: 0.5, // Reduced intensity for a more subtle glow
              // roughness: 0.5, // Some roughness to add shading to the surface
              // metalness: 0, // No metallic reflection
            });
          }
        });

        // Add the star model to the scene
        scene.add(star);
        stars.push({
          object: star,
          rotationSpeed: THREE.MathUtils.randFloat(0.001, 0.01)
        });
      }
    },
    undefined,
    function (error) {
      console.error('An error occurred while loading the star model:', error);
    }
  );
}
Array(500).fill().forEach(addStar);

// const mtlLoader = new MTLLoader();
// const objLoader = new OBJLoader();

// let ship;
// mtlLoader.load('public/images/shuttle.mtl', function (materials) {
//   materials.preload();
//   objLoader.setMaterials(materials);
//   objLoader.load('public/images/shuttle.obj', function (object) {
//     object.position.z = 10;
//     object.position.y = 1;
//     object.rotateX(-1 / 12 * Math.PI);
//     object.rotateY(1 / 12 * Math.PI);
//     // object.rotateZ(-1/10*Math.PI);
//     ship = object;
//     scene.add(ship);
//   });
// });

let shuttle;
loader.load(assetPath('images/space_shuttle.glb'), (gltf) => {
  shuttle = new THREE.Group();
  const shuttleModel = gltf.scene;

  shuttle.position.set(0, 1, 10);
  shuttle.scale.set(.04, .04, .04);

  shuttleModel.rotateX(-0.2618);
  shuttleModel.rotateY(1.6);
  shuttle.userData.baseRotationZ = shuttle.rotation.z;
  shuttle.add(shuttleModel);

  scene.add(shuttle);
});

const clock = new THREE.Clock();
const mixers = [];
loader.load(assetPath('images/saturn_planet.glb'), (gltf) => {
  const saturn = gltf.scene;

  saturn.position.set(17, 10, 54);
  saturn.scale.set(5, 5, 5);
  saturn.rotateX(0.1);
  saturn.rotateZ(0.3);

  scene.add(saturn);

  const mixer = new THREE.AnimationMixer(saturn);
  gltf.animations.forEach((clip) => {
    mixer.clipAction(clip).play();
  });

  mixers.push(mixer);
});

/* 
Textures only appear if i make the object myself in blender and paint it myself for some reason which i tested with the thank you message that i made myself
if i download one, even though the textures show up in blender, it doesnt work and i dont know why
i really dont want to model it myself so yeah im going to keep trying
*/
// let shuttle;
// loader.load('public/images/shuttle.glb',
//   function (gltf) {
//     shuttle = gltf.scene;
//     scene.add(shuttle);
//   },
//   function (xhr) {},
//   function (error) {}
// );

let thanks;
loader.load(assetPath('images/thanks.glb'),
  function (gltf) {
    thanks = gltf.scene;
    thanks.position.z = 54;
    thanks.position.y = 12;
    thanks.position.x = 11;
    scene.add(thanks);
  },
  function (xhr) { },
  function (error) { }
);
const thanksLight = new THREE.PointLight(0xFFFFFF, 25, 25, 1);
thanksLight.position.set(11, 12, 70);
scene.add(thanksLight);
// const lightHelper = new THREE.PointLightHelper(thanksLight);
// scene.add(lightHelper);

// const spaceTexture = new THREE.TextureLoader().load('https://raw.githubusercontent.com/CHemmestad/3DResume/main/public/images/earth.jpg');
// scene.background = spaceTexture;

caleb.position.z = -8;
caleb.position.x = 5.4;
mars.position.z = 10;
mars.position.setX(-8);

const moonBaseScale = 1;
const shuttleBaseScale = 0.04;

function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  const scrollAmount = Math.abs(t);
  const shrinkStart = 600;
  const shrinkDistance = 6000;
  const shrinkProgress = THREE.MathUtils.clamp((scrollAmount - shrinkStart) / shrinkDistance, 0, 1);
  const shrinkScale = THREE.MathUtils.lerp(1, 0.15, shrinkProgress);

  // mars.rotation.x += .05;
  mars.rotation.y += .01;
  // mars.rotation.z += .05;
  mars.scale.setScalar(moonBaseScale * shrinkScale);

  if (shuttle) {
    shuttle.scale.setScalar(shuttleBaseScale * shrinkScale);
  }

  caleb.rotation.y += .01;
  caleb.rotation.z += .01;
  caleb.position.z = t * .2;
  caleb.position.z = Math.min(caleb.position.z, -8);
  caleb.position.x = 2*(2.7*Math.exp(-10*(camera.position.z-1)));
  // console.log(2*(2.718*Math.exp(-10*(camera.position.z-1))));
  // console.log(camera.position.z-1);
  // console.log(caleb.position.x + ', ' + caleb.position.z);

  // backgroundMesh.position.z = Math.min(backgroundMesh.position.z, -100);
  backgroundMesh.position.z = t * .1 + -100;

  camera.position.z = t * -.01;
  camera.position.x = t * -.002;
  camera.position.y = t * -.002;
  camera.position.z = Math.max(camera.position.z, 1);

}
document.body.onscroll = moveCamera;

const value = 0.0025;
const rotation = 0.2;
const speed = 0.0025;
const maxDistance = 12;
const minDistance = 10;
let dir = 'r';
let mov = 'f';
function animateShip(ship) {
  const baseRotationZ = ship.userData.baseRotationZ ?? ship.rotation.z;

  if (dir === 'r') {
    ship.rotation.z -= value;
  } else if (dir === 'l') {
    ship.rotation.z += value;
  }
  if (ship.rotation.z <= baseRotationZ - rotation) {
    dir = 'l';
  } else if (ship.rotation.z >= baseRotationZ + rotation) {
    dir = 'r';
  }

  if (mov === 'f') {
    ship.position.z += speed;
  } else if (mov === 'b') {
    ship.position.z -= speed;
  }
  if (ship.position.z <= minDistance) {
    mov = 'f';
  } else if (ship.position.z >= maxDistance) {
    mov = 'b';
  }
}

function animate() {
  requestAnimationFrame(animate);

  mars.rotation.y += 0.0025;

  if (thanks) {
    thanks.rotation.y -= 0.005;
  }

  if (shuttle) {
    animateShip(shuttle);
  }

  stars.forEach(({ object, rotationSpeed }) => {
    object.rotation.y += rotationSpeed;
  });

  const delta = clock.getDelta();

  mixers.forEach((mixer) => {
    mixer.update(delta);
  });

  controls.update();

  renderer.render(scene, camera);
}
animate();
