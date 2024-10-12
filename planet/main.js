import "./style.css";

import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import gsap from 'gsap';


// Create scene
const scene = new THREE.Scene();
// Create camera
const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 9;

// Create renderer
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("canvas"),
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set pixel ratio for better rendering
renderer.setPixelRatio(window.devicePixelRatio);

const radius = 1.3;
const segments = 62;
const colors = [0x00ff00, 0x0000ff, 0xff0000, 0xffff00];

const orbitRadius = 4.5;
const textures = [
    './csilia/color.png',
    './earth/map.jpg',
    './venus/map.jpg',
    './volcanic/color.png',
];
const spheres = new THREE.Group();

// Create a big sphere with stars texture

const starTextureLoader = new THREE.TextureLoader();
const starTexture = starTextureLoader.load('./stars.jpg');
 // Assuming you have a starfield texture
starTexture.colorSpace = THREE.SRGBColorSpace;
// Create geometry and material for the star sphere
const starGeometry = new THREE.SphereGeometry(50,64,64);
const starMaterial = new THREE.MeshBasicMaterial({
    map: starTexture,
    transparent: true,
    opacity: 0.6,
    side: THREE.BackSide // Render the inside of the sphere
});

// Create the star sphere mesh and add it to the scene
const starSphere = new THREE.Mesh(starGeometry, starMaterial);
scene.add(starSphere);


// Create HDRI lighting
const loader = new RGBELoader();
loader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/evening_road_01_4k.hdr',
function(texture){
    texture.mapping = THREE.EquirectangularReflectionMapping;
    
    scene.environment = texture;
}); 

const spheresMesh = [];



for(let i = 0 ; i<4; i++){
    // Create a sphere
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(textures[i]);
    texture.colorSpace = THREE.SRGBColorSpace;
    const geometry = new THREE.SphereGeometry(radius, segments, segments);
    const material = new THREE.MeshBasicMaterial({map: texture });
    const sphere = new THREE.Mesh(geometry, material);
    
    spheresMesh.push(sphere);
    const angle = (i/4) * (Math.PI * 2);
    sphere.position.x = Math.cos(angle) * orbitRadius;
    sphere.position.z = Math.sin(angle) * orbitRadius;
    spheres.add(sphere);
}
spheres.rotation.x = 0.1;
spheres.position.y = -0.8;
scene.add(spheres);

let lastWheelTime = 0;
const throttleDelay = 2000;
let scrollCount = 0

function throttledWheelHandler(event){
    const currentTime = Date.now();
    if(currentTime - lastWheelTime >= throttleDelay){
        
        lastWheelTime = currentTime;
        const direction = event.deltaY > 0 ? "down" : "up";

        scrollCount = (scrollCount+1)%4;

        const headings = document.querySelectorAll("#heading");
        gsap.to(headings,{
            duration: 1,
            y:`-=${100}%`,
            ease: "power2.inOut",
        });

        gsap.to(spheres.rotation,{
            duration: 1,
            y: `-=${Math.PI/2}%`,
            ease: "power2.inOut",
        })
        if(scrollCount === 0){
            gsap.to(headings,{
                duration: 1,
                y:'0',
                ease: "power2.inOut",
            });
        
    }
}
}

window.addEventListener("wheel", throttledWheelHandler);

// Animation loop
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    for(let i = 0; i<spheresMesh.length; i++){
        const sphere = spheresMesh[i];
        sphere.rotation.y = clock.getElapsedTime() * (0.03);
    }
    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
