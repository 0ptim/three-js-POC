import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

let object, controls, mixer;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const loader = new GLTFLoader();
const clock = new THREE.Clock();
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container").appendChild(renderer.domElement);
const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(500, 500, 500);
topLight.castShadow = true;
scene.add(topLight);
const ambientLight = new THREE.AmbientLight(0x333333, 5);
scene.add(ambientLight);
controls = new OrbitControls(camera, renderer.domElement);

camera.position.set(3, 1, 3);

let gltfObject;

loader.load(
  `models/scene.gltf`,
  (gltf) => {
    gltfObject = gltf;
    console.log(gltf.animations);
    mixer = new THREE.AnimationMixer(gltf.scene);
    object = gltf.scene;
    scene.add(object);
    changeAnimation("Combat_Idle");
  },
  (xhr) => console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`),
  (error) => {
    console.error("An error happened during GLTF load", error);
    return Promise.reject(error);
  }
);

let activeAction;
let previousAction;

function changeAnimation(animationName) {
  if (mixer && object) {
    previousAction = activeAction;
    activeAction = mixer.clipAction(
      gltfObject.animations.find(
        (animation) => animation.name === animationName
      )
    );

    if (previousAction) {
      previousAction.fadeOut(0.3);
    }

    activeAction.reset().setEffectiveTimeScale(1).setDuration(1).play();
  }
}

let isWalking = false;
let isRunning = false;

window.addEventListener("keydown", function (e) {
  switch (e.key) {
    case "w":
      if (isWalking) return;
      isWalking = true;
      changeAnimation("Walk");
      break;

    case "Shift":
      if (!isWalking) return;
      if (isRunning) return;
      isRunning = true;
      changeAnimation("Run");
      break;
    case "f":
      changeAnimation("Fist_Fight");
      isWalking = false;
      break;
    case "k":
      changeAnimation("High_Kick");
      isWalking = false;
      break;
  }
});

window.addEventListener("keyup", function (e) {
  switch (e.key) {
    case "w":
      console.log("stop");
      isWalking = false;
      isRunning = false;
      changeAnimation("Combat_Idle");
      break;
    case "Shift":
      isRunning = false;
      changeAnimation("Walk");
      break;
  }
});

function animate() {
  requestAnimationFrame(animate);
  mixer && mixer.update(clock.getDelta());
  renderer.render(scene, camera);
}

const resizeListener = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

window.addEventListener("resize", resizeListener);

animate();
