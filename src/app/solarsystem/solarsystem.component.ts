import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Line, LineBasicMaterial, Mesh, MeshBasicMaterial, MeshStandardMaterial, MeshLambertMaterial, PerspectiveCamera, RingGeometry, Scene, SphereGeometry, BufferGeometry, PointLight, WebGLRenderer } from 'three';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import gsap from 'gsap';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { Layers } from 'three';

@Component({
  selector: 'app-solarsystem',
  templateUrl: './solarsystem.component.html',
  styleUrls: ['./solarsystem.component.scss'],
})
export class SolarsystemComponent implements OnInit, AfterViewInit {
  @ViewChild('threejs') canvas!: ElementRef<HTMLCanvasElement>;

  // Data for planets
  planets = [
    { name: 'Merkur', info: 'Orbitdauer: 88 Tage, Abstand zur Sonne: 57.91 Mio. km, Geschwindigkeit: 47.87 km/s' },
    { name: 'Venus', info: 'Orbitdauer: 225 Tage, Abstand zur Sonne: 108.2 Mio. km, Geschwindigkeit: 35.02 km/s' },
    { name: 'Erde', info: 'Orbitdauer: 365 Tage, Abstand zur Sonne: 149.6 Mio. km, Geschwindigkeit: 29.78 km/s' },
    { name: 'Mars', info: 'Orbitdauer: 687 Tage, Abstand zur Sonne: 227.9 Mio. km, Geschwindigkeit: 24.07 km/s' },
    { name: 'Jupiter', info: 'Orbitdauer: 11.86 Jahre, Abstand zur Sonne: 778.5 Mio. km, Geschwindigkeit: 13.07 km/s' },
    { name: 'Saturn', info: 'Orbitdauer: 29.46 Jahre, Abstand zur Sonne: 1.434 Mrd. km, Geschwindigkeit: 9.69 km/s' },
    { name: 'Uranus', info: 'Orbitdauer: 84 Jahre, Abstand zur Sonne: 2.871 Mrd. km, Geschwindigkeit: 6.81 km/s' },
    { name: 'Neptun', info: 'Orbitdauer: 164.8 Jahre, Abstand zur Sonne: 4.495 Mrd. km, Geschwindigkeit: 5.43 km/s' }
  ];
  

  selectedPlanet: { name: string; info: string } | null = null;
  trackedPlanet: THREE.Mesh | null = null;
  isTracking: boolean = false;

  scene!: Scene;
  camera!: PerspectiveCamera;
  renderer!: WebGLRenderer;
  composer!: EffectComposer;
  clock = new THREE.Clock();
  controls!: OrbitControls;

  sun!: Mesh;
  sunScene!: Scene;
  renderTarget!: THREE.WebGLRenderTarget;

  mercury!: Mesh;
  venus!: Mesh;
  earth!: Mesh;
  moon!: Mesh;
  mars!: Mesh;
  jupiter!: Mesh;
  saturn!: Mesh;
  saturnRings!: Mesh;
  uranus!: Mesh;
  neptune!: Mesh;

  ufo!: THREE.Object3D;

  SIZE_SCALE = 0.2;

  mercuryOrbitRadius = 25;
  venusOrbitRadius = 40;
  earthOrbitRadius = 60;
  marsOrbitRadius = 90;
  jupiterOrbitRadius = 200;
  saturnOrbitRadius = 300;
  uranusOrbitRadius = 400;
  neptuneOrbitRadius = 500;
  moonOrbitRadius = 10;

  earthOrbitTime = 10;
  mercuryOrbitTime = this.earthOrbitTime * 0.24;
  venusOrbitTime = this.earthOrbitTime * 0.615;
  moonOrbitTime = this.earthOrbitTime * 0.083;
  marsOrbitTime = this.earthOrbitTime * 1.88
  jupiterOrbitTime = this.earthOrbitTime * 11.86;
  saturnOrbitTime = this.earthOrbitTime * 29.46;
  uranusOrbitTime = this.earthOrbitTime * 84;
  neptuneOrbitTime = this.earthOrbitTime * 164.8;


  constructor() {}

  ngOnInit() {}
  
  // Display information
  showPlanetInfo(planetData: any) {
    this.selectedPlanet = planetData;
  
    // Track selected planet
    switch (planetData.name) {
      case 'Merkur':
        this.trackPlanet(this.mercury);
        break;
      case 'Venus':
        this.trackPlanet(this.venus);
        break;
      case 'Erde':
        this.trackPlanet(this.earth);
        break;
      case 'Mond':
        this.trackPlanet(this.moon);
        break;
      case 'Mars':
        this.trackPlanet(this.mars);
        break;
      case 'Jupiter':
        this.trackPlanet(this.jupiter);
        break;
      case 'Saturn':
        this.trackPlanet(this.saturn);
        break;
      case 'Uranus':
        this.trackPlanet(this.uranus);
        break;
      case 'Neptun':
        this.trackPlanet(this.neptune);
        break;
    }
  }
  
  // Reset scaling
  resetPlanetHighlight() {
    this.mercury.scale.set(2 * this.SIZE_SCALE, 2 * this.SIZE_SCALE, 2 * this.SIZE_SCALE);
    this.venus.scale.set(4 * this.SIZE_SCALE, 4 * this.SIZE_SCALE, 4 * this.SIZE_SCALE);
    this.earth.scale.set(4 * this.SIZE_SCALE, 4 * this.SIZE_SCALE, 4 * this.SIZE_SCALE);
    this.moon.scale.set(0.8 * this.SIZE_SCALE, 0.8 * this.SIZE_SCALE, 0.8 * this.SIZE_SCALE);
    this.mars.scale.set(3 * this.SIZE_SCALE, 3 * this.SIZE_SCALE, 3 * this.SIZE_SCALE);
    this.jupiter.scale.set(16 * this.SIZE_SCALE, 16 * this.SIZE_SCALE, 16 * this.SIZE_SCALE);
    this.saturn.scale.set(12 * this.SIZE_SCALE, 12 * this.SIZE_SCALE, 12 * this.SIZE_SCALE);
    this.uranus.scale.set(7 * this.SIZE_SCALE, 7 * this.SIZE_SCALE, 7 * this.SIZE_SCALE);
    this.neptune.scale.set(6 * this.SIZE_SCALE, 6 * this.SIZE_SCALE, 6 * this.SIZE_SCALE);
  }

  ngAfterViewInit() {
    this.scene = new Scene();
    const textureLoader = new THREE.TextureLoader();

    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
    this.camera.position.set(600, 300, 600);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new WebGLRenderer({ canvas: this.canvas.nativeElement, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;

    this.addBackground();

    const fbxLoader = new FBXLoader();
    fbxLoader.load('assets/UFO.fbx', (object) => {
      this.ufo = object;
      this.ufo.scale.set(0.3, 0.3, 0.3);
      this.scene.add(this.ufo);
    });

    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    this.sun = new Mesh(new SphereGeometry(15 * 0.5 , 32, 32), new MeshBasicMaterial({ color: 0xffcc00 }));

    const sunlight = new PointLight(0xffffff, 6, 0, 0);
    sunlight.position.set(0, 0, 0);
    sunlight.castShadow = true;
    sunlight.shadow.mapSize.width = 10000;
    sunlight.shadow.mapSize.height = 10000;
    this.scene.add(sunlight);

    this.mercury = new Mesh(new SphereGeometry(2 * this.SIZE_SCALE, 32, 32), new MeshStandardMaterial({map: textureLoader.load('assets/2k_mercury.jpg')}));
    this.venus = new Mesh(new SphereGeometry(4 * this.SIZE_SCALE, 32, 32), new MeshStandardMaterial({map: textureLoader.load('assets/2k_venus_atmosphere.jpg')}));

    //mit heightmap
    this.earth = new Mesh(
      new SphereGeometry(4 * this.SIZE_SCALE, 32, 32),
      new MeshStandardMaterial({
        map: textureLoader.load('assets/2k_earth_daymap.jpg'),
        displacementMap: textureLoader.load('assets/earth_height_map.png'),
        displacementScale: 0.1,
        normalMap: textureLoader.load('assets/Earth_Normal_Map.jpg'),
        roughness: 0.1,
        metalness: 0,
      })
    );

    //ohne heightmap
    //this.earth = new Mesh(new SphereGeometry(4 * this.SIZE_SCALE, 32, 32),new MeshStandardMaterial({map: textureLoader.load('assets/2k_earth_daymap.jpg'),}));
    

    this.mars = new Mesh(new SphereGeometry(3 * this.SIZE_SCALE, 32, 32), new MeshStandardMaterial({map: textureLoader.load('assets/2k_mars.jpg')}));
    this.jupiter = new Mesh(new SphereGeometry(16 * this.SIZE_SCALE, 32, 32), new MeshStandardMaterial({map: textureLoader.load('assets/2k_jupiter.jpg')}));

    this.saturn = new Mesh(new SphereGeometry(12 * this.SIZE_SCALE, 32, 32), new MeshStandardMaterial({map: textureLoader.load('assets/2k_saturn.jpg')}));

    this.uranus = new Mesh(new SphereGeometry(7 * this.SIZE_SCALE, 32, 32), new MeshStandardMaterial({map: textureLoader.load('assets/2k_uranus.jpg')}));

    this.neptune = new Mesh(new SphereGeometry(6 * this.SIZE_SCALE, 32, 32), new MeshStandardMaterial({map: textureLoader.load('assets/2k_neptune.jpg')}));

    const ringMaterial = new MeshStandardMaterial({ map: textureLoader.load('assets/saturn_rings.png'), side: THREE.DoubleSide, opacity: 0.8, transparent: true });
    const ringGeometry = new RingGeometry(15 * this.SIZE_SCALE, 25 * this.SIZE_SCALE, 64);
    
    this.saturnRings = new Mesh(ringGeometry,ringMaterial);
    
    this.saturn.add(this.saturnRings);
    this.scene.add(this.saturnRings);
    
    const moonGeometry = new SphereGeometry(0.8 * this.SIZE_SCALE, 32, 32);
    const moonMaterial = new MeshLambertMaterial({ color: 0xaaaaaa });
    this.moon = new Mesh(moonGeometry, moonMaterial);
    this.moon.castShadow = true;
    this.moon.receiveShadow = true;
    this.scene.add(this.moon);

    this.createOrbitPath(this.mercuryOrbitRadius);
    this.createOrbitPath(this.venusOrbitRadius);
    this.createOrbitPath(this.earthOrbitRadius);
    this.createOrbitPath(this.marsOrbitRadius);
    this.createOrbitPath(this.jupiterOrbitRadius);
    this.createOrbitPath(this.saturnOrbitRadius);
    this.createOrbitPath(this.uranusOrbitRadius);
    this.createOrbitPath(this.neptuneOrbitRadius);

    this.scene.add(this.sun);
    this.scene.add(this.mercury);
    this.scene.add(this.venus);
    this.scene.add(this.earth);
    this.scene.add(this.mars);
    this.scene.add(this.jupiter);
    this.scene.add(this.saturn);
    this.scene.add(this.uranus);
    this.scene.add(this.neptune);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;

    this.renderer.setAnimationLoop(() => this.animate());
  }

  addBackground() {
    const rgbeLoader = new RGBELoader();
  
    rgbeLoader.load('assets/HDR_blue_nebulae-1.hdr', (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
  
      this.scene.environment = texture;
  
      this.scene.background = texture;
    });
  }

  createOrbitPath(radius: number) {
    //points for path
    const points = [];
    //how many points
    const segments = 100;
    //creates points
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(radius * Math.cos(angle), 0, radius * Math.sin(angle)));
    }

    //creating line
    const geometry = new BufferGeometry().setFromPoints(points);
    const material = new LineBasicMaterial({ color: 0xaaaaaa, opacity: 0.5, transparent: true });
    const line = new Line(geometry, material);
    this.scene.add(line);
  }

  animate() {
    const elapsedTime = this.clock.getElapsedTime();
  
    //OrbitRadius = distance from the Sun
    //OrbitTime = time for one Full orbit
    //elapsedTime / this.OrbitTime * 2 * Math.PI = calculates angle that planet has moved around its orbit based on elapsed time
    // cos(angle) = x cords
    //sin(angle) = z cords
    this.mercury.position.x = this.mercuryOrbitRadius * Math.cos(elapsedTime / this.mercuryOrbitTime * 2 * Math.PI);
    this.mercury.position.z = this.mercuryOrbitRadius * Math.sin(elapsedTime / this.mercuryOrbitTime * 2 * Math.PI);
  
    this.venus.position.x = this.venusOrbitRadius * Math.cos(elapsedTime / this.venusOrbitTime * 2 * Math.PI);
    this.venus.position.z = this.venusOrbitRadius * Math.sin(elapsedTime / this.venusOrbitTime * 2 * Math.PI);
  
    this.earth.position.x = this.earthOrbitRadius * Math.cos(elapsedTime / this.earthOrbitTime * 2 * Math.PI);
    this.earth.position.z = this.earthOrbitRadius * Math.sin(elapsedTime / this.earthOrbitTime * 2 * Math.PI);
  
    this.mars.position.x = this.marsOrbitRadius * Math.cos(elapsedTime / this.marsOrbitTime * 2 * Math.PI);
    this.mars.position.z = this.marsOrbitRadius * Math.sin(elapsedTime / this.marsOrbitTime * 2 * Math.PI);
  
    this.jupiter.position.x = this.jupiterOrbitRadius * Math.cos(elapsedTime / this.jupiterOrbitTime * 2 * Math.PI);
    this.jupiter.position.z = this.jupiterOrbitRadius * Math.sin(elapsedTime / this.jupiterOrbitTime * 2 * Math.PI);
  
    this.saturn.position.x = this.saturnOrbitRadius * Math.cos(elapsedTime / this.saturnOrbitTime * 2 * Math.PI);
    this.saturn.position.z = this.saturnOrbitRadius * Math.sin(elapsedTime / this.saturnOrbitTime * 2 * Math.PI);

    //this.saturnRings.rotation.x = Math.PI / 180 * 27; = rotation of rings along x axis
    //this.saturnRings.rotation.z = Math.PI / 2; = rotation of rings along the z axis
    this.saturnRings.position.copy(this.saturn.position);
    this.saturnRings.rotation.x = Math.PI / 180 * 27;
    this.saturnRings.rotation.z = Math.PI / 2;
  
    this.uranus.position.x = this.uranusOrbitRadius * Math.cos(elapsedTime / this.uranusOrbitTime * 2 * Math.PI);
    this.uranus.position.z = this.uranusOrbitRadius * Math.sin(elapsedTime / this.uranusOrbitTime * 2 * Math.PI);
  
    this.neptune.position.x = this.neptuneOrbitRadius * Math.cos(elapsedTime / this.neptuneOrbitTime * 2 * Math.PI);
    this.neptune.position.z = this.neptuneOrbitRadius * Math.sin(elapsedTime / this.neptuneOrbitTime * 2 * Math.PI);
  
    //this.earth.position.x and this.earth.position.z = Moons position updated relative to Earths position (so it can orbit)
    this.moon.position.x = this.earth.position.x + this.moonOrbitRadius * Math.cos(elapsedTime / this.moonOrbitTime * 2 * Math.PI);
    this.moon.position.z = this.earth.position.z + this.moonOrbitRadius * Math.sin(elapsedTime / this.moonOrbitTime * 2 * Math.PI);

    if (this.ufo) {
      const ufoOrbitRadius = 70;
      const ufoOrbitTime = 15;
  
      this.ufo.position.x = this.earth.position.x + ufoOrbitRadius * Math.cos(elapsedTime / ufoOrbitTime * 2 * Math.PI);
      this.ufo.position.z = this.earth.position.z + ufoOrbitRadius * Math.sin(elapsedTime / ufoOrbitTime * 2 * Math.PI);
    }

  
    if (this.trackedPlanet && this.isTracking) {
      const planetPosition = new THREE.Vector3();
      this.trackedPlanet.getWorldPosition(planetPosition);
  
      const offset = new THREE.Vector3(10, 10, 10);
      //offset to camera
      const targetPosition = planetPosition.clone().add(offset);
  
      //smoothly moves camera
      this.camera.position.lerp(targetPosition, 0.1);
  
      //always face planet
      this.camera.lookAt(planetPosition);
  
      //controls.target and controls.update() = follow planet
      this.controls.target.copy(planetPosition);
      this.controls.update();
    }

    this.renderer.clear();
    this.composer.render();
    this.renderer.render(this.scene, this.camera);
  }

  trackPlanet(planet: THREE.Mesh) {
    //set the planet to be tracked
    this.trackedPlanet = planet;
    this.isTracking = true;

    //store planets word position
    const planetPosition = new THREE.Vector3();
    
    //get the world position of planet and store it in planetPosition vector
    planet.getWorldPosition(planetPosition);

    //camera offset
    const offset = new THREE.Vector3(10, 10, 10);
    const targetPosition = planetPosition.clone().add(offset);

    this.camera.position.lerp(targetPosition, 0.1);
    this.camera.lookAt(planetPosition);

    //target planet
    this.controls.target.copy(planetPosition);
    this.controls.update();
  }


  resetView() {
    //disable and reset Tracking
    this.isTracking = false;
    this.trackedPlanet = null;
    this.selectedPlanet = null;

    //reset view
    const targetPosition = new THREE.Vector3(600, 300, 600);
    const focusPoint = new THREE.Vector3(0, 0, 0);

    //move camera's position back to the target position
    gsap.to(this.camera.position, {
      x: targetPosition.x,   // x-coordinate of the target position
      y: targetPosition.y,   // y-coordinate of the target position
      z: targetPosition.z,   // z-coordinate of the target position
      duration: 1.5,         // duration of the animation
      
      // Every time animation updates, adjust the camera's focus to look at focusPoint
      onUpdate: () => {
          //continuously make camera look at the focus point
          this.camera.lookAt(focusPoint);
          this.controls.target.copy(focusPoint);
      },

      onComplete: () => {
          this.controls.update();
      },
    });
  }
}