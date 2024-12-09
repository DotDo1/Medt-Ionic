import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Line, LineBasicMaterial, Mesh, MeshBasicMaterial, MeshLambertMaterial, PerspectiveCamera, RingGeometry, Scene, SphereGeometry, BufferGeometry, PointLight, WebGLRenderer } from 'three';
import * as THREE from 'three';

@Component({
  selector: 'app-solarsystem',
  templateUrl: './solarsystem.component.html',
  styleUrls: ['./solarsystem.component.scss'],
})
export class SolarsystemComponent implements OnInit, AfterViewInit {
  @ViewChild('threejs') canvas!: ElementRef<HTMLCanvasElement>;

  scene!: Scene;
  camera!: PerspectiveCamera;
  renderer!: WebGLRenderer;
  clock = new THREE.Clock();
  controls!: OrbitControls;

  sun!: Mesh;
  mercury!: Mesh;  // Merkur hinzugefügt
  venus!: Mesh;
  earth!: Mesh;
  moon!: Mesh;
  mars!: Mesh;
  jupiter!: Mesh;
  saturn!: Mesh;
  saturnRings!: Mesh;
  uranus!: Mesh;  // Uranus hinzugefügt
  neptune!: Mesh;  // Neptun hinzugefügt

  // Maßstab und Distanzen
  DISTANCE_SCALE = 0.1; // Maßstab für Distanzen
  SIZE_SCALE = 0.2; // Maßstab für Größen der Planeten und Sonne

  // Orbit-Radien (mit angepasstem Maßstab)
  mercuryOrbitRadius = 25; // Merkur
  venusOrbitRadius = 40; // Venus
  earthOrbitRadius = 60; // Erde
  marsOrbitRadius = 90; // Mars
  jupiterOrbitRadius = 200; // Jupiter
  saturnOrbitRadius = 300; // Saturn
  uranusOrbitRadius = 400; // Uranus
  neptuneOrbitRadius = 500; // Neptun
  moonOrbitRadius = 10; // Mond

  // Orbitalzeiten
  earthOrbitTime = 10; // Erde (Referenz)
  mercuryOrbitTime = this.earthOrbitTime * 0.24; // Merkur dauert 0.24 Erdenjahre
  venusOrbitTime = this.earthOrbitTime * 0.615; // Venus dauert 0.615 Erdenjahre
  moonOrbitTime = this.earthOrbitTime * 0.083;
  marsOrbitTime = this.earthOrbitTime * 1.88; // Mars dauert 1,88 Erdenjahre
  jupiterOrbitTime = this.earthOrbitTime * 11.86; // Jupiter dauert 11.86 Erdenjahre
  saturnOrbitTime = this.earthOrbitTime * 29.46; // Saturn dauert 29.46 Erdenjahre
  uranusOrbitTime = this.earthOrbitTime * 84; // Uranus dauert 84 Erdenjahre
  neptuneOrbitTime = this.earthOrbitTime * 164.8; // Neptun dauert 164.8 Erdenjahre

  constructor() {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.scene = new Scene();

    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(600, 300, 600); // Kamera weiter weg positionieren, damit alles sichtbar ist
    this.camera.lookAt(0, 0, 0);

    this.renderer = new WebGLRenderer({ canvas: this.canvas.nativeElement, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;

    // Sonne erstellen
    const sunGeometry = new SphereGeometry(15 * 0.5 , 32, 32); // Sonne in angemessener Größe
    const sunMaterial = new MeshBasicMaterial({ color: 0xffcc00 });
    this.sun = new Mesh(sunGeometry, sunMaterial);
    this.scene.add(this.sun);

    const sunlight = new PointLight(0xffffff, 500000, 10000); // Lichtquelle mit großer Reichweite
    sunlight.position.set(0, 0, 0);
    sunlight.castShadow = true;
    sunlight.shadow.mapSize.width = 2048; // Hochauflösender Schatten
    sunlight.shadow.mapSize.height = 2048;
    this.scene.add(sunlight);

    // Merkur erstellen
    const mercuryGeometry = new SphereGeometry(2 * this.SIZE_SCALE, 32, 32); // Merkur kleiner
    const mercuryMaterial = new MeshLambertMaterial({ color: 0x888888 });
    this.mercury = new Mesh(mercuryGeometry, mercuryMaterial);
    this.mercury.position.set(this.mercuryOrbitRadius, 0, 0);
    this.mercury.castShadow = true;
    this.mercury.receiveShadow = true;
    this.scene.add(this.mercury);

    // Venus erstellen
    const venusGeometry = new SphereGeometry(4 * this.SIZE_SCALE, 32, 32);
    const venusMaterial = new MeshLambertMaterial({ color: 0xffc300 });
    this.venus = new Mesh(venusGeometry, venusMaterial);
    this.venus.position.set(this.venusOrbitRadius, 0, 0);
    this.venus.castShadow = true;
    this.venus.receiveShadow = true;
    this.scene.add(this.venus);

    // Erde erstellen
    const earthGeometry = new SphereGeometry(4 * this.SIZE_SCALE, 32, 32);
    const earthMaterial = new MeshLambertMaterial({ color: 0x00ff00 });
    this.earth = new Mesh(earthGeometry, earthMaterial);
    this.earth.position.set(this.earthOrbitRadius, 0, 0);
    this.earth.castShadow = true;
    this.earth.receiveShadow = true;
    this.scene.add(this.earth);

    // Mond erstellen
    const moonGeometry = new SphereGeometry(0.8 * this.SIZE_SCALE, 32, 32);
    const moonMaterial = new MeshLambertMaterial({ color: 0xaaaaaa });
    this.moon = new Mesh(moonGeometry, moonMaterial);
    this.moon.castShadow = true;
    this.moon.receiveShadow = true;
    this.scene.add(this.moon);

    // Mars erstellen
    const marsGeometry = new SphereGeometry(3 * this.SIZE_SCALE, 32, 32);
    const marsMaterial = new MeshLambertMaterial({ color: 0xff5733 });
    this.mars = new Mesh(marsGeometry, marsMaterial);
    this.mars.position.set(this.marsOrbitRadius, 0, 0);
    this.mars.castShadow = true;
    this.mars.receiveShadow = true;
    this.scene.add(this.mars);

    // Jupiter erstellen
    const jupiterGeometry = new SphereGeometry(16 * this.SIZE_SCALE, 32, 32);
    const jupiterMaterial = new MeshLambertMaterial({ color: 0x8B4513 });
    this.jupiter = new Mesh(jupiterGeometry, jupiterMaterial);
    this.jupiter.position.set(this.jupiterOrbitRadius, 0, 0);
    this.jupiter.castShadow = true;
    this.jupiter.receiveShadow = true;
    this.scene.add(this.jupiter);

    // Saturn erstellen
    const saturnGeometry = new SphereGeometry(12 * this.SIZE_SCALE, 32, 32);
    const saturnMaterial = new MeshLambertMaterial({ color: 0xF4A300 });
    this.saturn = new Mesh(saturnGeometry, saturnMaterial);
    this.saturn.position.set(this.saturnOrbitRadius, 0, 0);
    this.saturn.castShadow = true;
    this.saturn.receiveShadow = true;
    this.scene.add(this.saturn);

    // Saturn Ringe erstellen
    const ringGeometry = new RingGeometry(15, 18, 64);
    const ringMaterial = new MeshLambertMaterial({ color: 0xD3D3D3, side: 2, opacity: 0.7, transparent: true });
    this.saturnRings = new Mesh(ringGeometry, ringMaterial);
    this.saturnRings.rotation.x = -Math.PI / 2;
    this.saturn.add(this.saturnRings);

    // Uranus erstellen
    const uranusGeometry = new SphereGeometry(7 * this.SIZE_SCALE, 32, 32);
    const uranusMaterial = new MeshLambertMaterial({ color: 0x00ffff });
    this.uranus = new Mesh(uranusGeometry, uranusMaterial);
    this.uranus.position.set(this.uranusOrbitRadius, 0, 0);
    this.uranus.castShadow = true;
    this.uranus.receiveShadow = true;
    this.scene.add(this.uranus);

    // Neptun erstellen
    const neptuneGeometry = new SphereGeometry(6 * this.SIZE_SCALE, 32, 32);
    const neptuneMaterial = new MeshLambertMaterial({ color: 0x0000ff });
    this.neptune = new Mesh(neptuneGeometry, neptuneMaterial);
    this.neptune.position.set(this.neptuneOrbitRadius, 0, 0);
    this.neptune.castShadow = true;
    this.neptune.receiveShadow = true;
    this.scene.add(this.neptune);

    // Orbit Paths erstellen
    this.createOrbitPath(this.mercuryOrbitRadius);
    this.createOrbitPath(this.venusOrbitRadius);
    this.createOrbitPath(this.earthOrbitRadius);
    this.createOrbitPath(this.marsOrbitRadius);
    this.createOrbitPath(this.jupiterOrbitRadius);
    this.createOrbitPath(this.saturnOrbitRadius);
    this.createOrbitPath(this.uranusOrbitRadius);
    this.createOrbitPath(this.neptuneOrbitRadius);

    // OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;

    this.renderer.setAnimationLoop(() => this.animate());
  }
  createOrbitPath(radius: number) {
    const points = [];
    const segments = 100;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(radius * Math.cos(angle), 0, radius * Math.sin(angle)));
    }

    const geometry = new BufferGeometry().setFromPoints(points);
    const material = new LineBasicMaterial({ color: 0xaaaaaa, opacity: 0.5, transparent: true });
    const line = new Line(geometry, material);
    this.scene.add(line);
  }

  // Animation für Planetenbewegung
  animate() {
    const elapsedTime = this.clock.getElapsedTime();
  
    // Bewegung der Erde
    this.earth.position.x = this.earthOrbitRadius * Math.cos(elapsedTime / this.earthOrbitTime * 2 * Math.PI);
    this.earth.position.z = this.earthOrbitRadius * Math.sin(elapsedTime / this.earthOrbitTime * 2 * Math.PI);
  
    // Mond bewegt sich um die Erde
    this.moon.position.x = this.earth.position.x + this.moonOrbitRadius * Math.cos(elapsedTime / this.moonOrbitTime * 2 * Math.PI);
    this.moon.position.z = this.earth.position.z + this.moonOrbitRadius * Math.sin(elapsedTime / this.moonOrbitTime * 2 * Math.PI);
  
    // Bewegung von Merkur
    this.mercury.position.x = this.mercuryOrbitRadius * Math.cos(elapsedTime / this.mercuryOrbitTime * 2 * Math.PI);
    this.mercury.position.z = this.mercuryOrbitRadius * Math.sin(elapsedTime / this.mercuryOrbitTime * 2 * Math.PI);
  
    // Bewegung von Venus
    this.venus.position.x = this.venusOrbitRadius * Math.cos(elapsedTime / this.venusOrbitTime * 2 * Math.PI);
    this.venus.position.z = this.venusOrbitRadius * Math.sin(elapsedTime / this.venusOrbitTime * 2 * Math.PI);
  
    // Bewegung von Mars
    this.mars.position.x = this.marsOrbitRadius * Math.cos(elapsedTime / this.marsOrbitTime * 2 * Math.PI);
    this.mars.position.z = this.marsOrbitRadius * Math.sin(elapsedTime / this.marsOrbitTime * 2 * Math.PI);
  
    // Bewegung von Jupiter
    this.jupiter.position.x = this.jupiterOrbitRadius * Math.cos(elapsedTime / this.jupiterOrbitTime * 2 * Math.PI);
    this.jupiter.position.z = this.jupiterOrbitRadius * Math.sin(elapsedTime / this.jupiterOrbitTime * 2 * Math.PI);
  
    // Bewegung von Saturn
    this.saturn.position.x = this.saturnOrbitRadius * Math.cos(elapsedTime / this.saturnOrbitTime * 2 * Math.PI);
    this.saturn.position.z = this.saturnOrbitRadius * Math.sin(elapsedTime / this.saturnOrbitTime * 2 * Math.PI);
  
    // Bewegung von Uranus
    this.uranus.position.x = this.uranusOrbitRadius * Math.cos(elapsedTime / this.uranusOrbitTime * 2 * Math.PI);
    this.uranus.position.z = this.uranusOrbitRadius * Math.sin(elapsedTime / this.uranusOrbitTime * 2 * Math.PI);
  
    // Bewegung von Neptun
    this.neptune.position.x = this.neptuneOrbitRadius * Math.cos(elapsedTime / this.neptuneOrbitTime * 2 * Math.PI);
    this.neptune.position.z = this.neptuneOrbitRadius * Math.sin(elapsedTime / this.neptuneOrbitTime * 2 * Math.PI);
  
    // Renderer aufrufen
    this.renderer.render(this.scene, this.camera);
  }
}