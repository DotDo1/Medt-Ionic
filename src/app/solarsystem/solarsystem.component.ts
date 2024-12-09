import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { AmbientLight, Clock, DirectionalLight, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, MeshLambertMaterial, PerspectiveCamera, RingGeometry, Scene, SphereGeometry, BufferGeometry, Float32BufferAttribute, WebGLRenderer } from 'three';
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
  clock = new Clock();
  controls!: OrbitControls;

  sun!: Mesh;
  earth!: Mesh;
  moon!: Mesh; // Mond hinzufügen
  jupiter!: Mesh;
  saturn!: Mesh;
  saturnRings!: Mesh; // Saturn Ringe hinzufügen
  
  earthOrbitRadius = 10; // 1 AU = 10 units
  jupiterOrbitRadius = 52; // 5.2 AU = 52 units
  saturnOrbitRadius = 95.8; // 9.58 AU = 95.8 units
  moonOrbitRadius = 2; // Der Mond ist 2 Einheiten von der Erde entfernt

  // Zeitdauern in Sekunden für einen vollen Orbit (Skalierung)
  earthOrbitTime = 10;  // 10 Sekunden für einen Erdenorbit
  moonOrbitTime = this.earthOrbitTime * 0.083; // Der Mond benötigt etwa 1 Monat für einen Orbit (skalierte Zeit)
  jupiterOrbitTime = this.earthOrbitTime * 11.86; // Jupiter dauert 11.86 Jahre
  saturnOrbitTime = this.earthOrbitTime * 29.46; // Saturn dauert 29.46 Jahre

  constructor() {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.scene = new Scene();

    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(200, 200, 200); // Positioniere die Kamera weit genug entfernt
    this.camera.lookAt(0, 0, 0);

    this.renderer = new WebGLRenderer({ canvas: this.canvas.nativeElement, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true; // Aktivieren der Schattengenerierung

    // Nur Directional Light (Sonnenlicht), kein Ambient Light
    const directionalLight = new DirectionalLight(0xffffff, 1); // Helles Sonnenlicht
    directionalLight.position.set(200, 200, 200); // Positionierung des Lichts
    directionalLight.castShadow = true; // Aktivieren der Schattengenerierung
    directionalLight.shadow.mapSize.width = 1024;  // Auflösung der Schatten
    directionalLight.shadow.mapSize.height = 1024;
    this.scene.add(directionalLight);

    // Sonne erstellen
    const sunGeometry = new SphereGeometry(5, 32, 32);
    const sunMaterial = new MeshBasicMaterial({ color: 0xffcc00 });
    this.sun = new Mesh(sunGeometry, sunMaterial);
    this.scene.add(this.sun);

    // Erde erstellen
    const earthGeometry = new SphereGeometry(1, 32, 32);
    const earthMaterial = new MeshLambertMaterial({ color: 0x00ff00 });
    this.earth = new Mesh(earthGeometry, earthMaterial);
    this.earth.position.set(this.earthOrbitRadius, 0, 0);
    this.earth.castShadow = true;  // Erde kann Schatten werfen
    this.earth.receiveShadow = true;  // Erde kann Schatten empfangen
    this.scene.add(this.earth);

    // Mond erstellen und um die Erde platzieren
    const moonGeometry = new SphereGeometry(0.27, 32, 32); // Mond ist kleiner als die Erde
    const moonMaterial = new MeshLambertMaterial({ color: 0xaaaaaa });
    this.moon = new Mesh(moonGeometry, moonMaterial);
    this.moon.castShadow = true; // Mond kann Schatten werfen
    this.moon.receiveShadow = true; // Mond kann Schatten empfangen
    this.scene.add(this.moon);

    // Jupiter erstellen
    const jupiterGeometry = new SphereGeometry(2, 32, 32);
    const jupiterMaterial = new MeshLambertMaterial({ color: 0x8B4513 });
    this.jupiter = new Mesh(jupiterGeometry, jupiterMaterial);
    this.jupiter.position.set(this.jupiterOrbitRadius, 0, 0);
    this.jupiter.castShadow = true;  // Jupiter kann Schatten werfen
    this.jupiter.receiveShadow = true;  // Jupiter kann Schatten empfangen
    this.scene.add(this.jupiter);

    // Saturn erstellen
    const saturnGeometry = new SphereGeometry(2, 32, 32);
    const saturnMaterial = new MeshLambertMaterial({ color: 0xF4A300 });
    this.saturn = new Mesh(saturnGeometry, saturnMaterial);
    this.saturn.position.set(this.saturnOrbitRadius, 0, 0);
    this.saturn.castShadow = true;  // Saturn kann Schatten werfen
    this.saturn.receiveShadow = true;  // Saturn kann Schatten empfangen
    this.scene.add(this.saturn);

    // Saturn Ringe erstellen
    const ringGeometry = new RingGeometry(3, 5, 64); // Der Ring hat einen inneren Radius von 3 und einen äußeren von 5
    const ringMaterial = new MeshLambertMaterial({ color: 0xaaaaaa, side: 2, opacity: 0.7, transparent: true });
    this.saturnRings = new Mesh(ringGeometry, ringMaterial);
    this.saturnRings.rotation.x = -Math.PI / 2; // Rotiere die Ringe, sodass sie flach um Saturn liegen
    this.saturn.add(this.saturnRings); // Ringe als Kind des Saturns hinzufügen, damit sie mit dem Saturn rotieren
    this.saturnRings.position.set(0, 0, 0); // Setze Ringe an die gleiche Position wie Saturn

    // Orbit Paths erstellen
    this.createOrbitPath(this.earthOrbitRadius);
    this.createOrbitPath(this.jupiterOrbitRadius);
    this.createOrbitPath(this.saturnOrbitRadius);

    // OrbitControls hinzufügen
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;

    this.renderer.setAnimationLoop(() => this.animate());
  }

  createOrbitPath(radius: number) {
    const points = [];
    const segments = 100;  // Anzahl der Segmente für den Orbit-Pfad
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(radius * Math.cos(angle), 0, radius * Math.sin(angle)));
    }

    const geometry = new BufferGeometry().setFromPoints(points);
    const material = new LineBasicMaterial({ color: 0xaaaaaa, opacity: 0.5, transparent: true });
    const line = new Line(geometry, material);
    this.scene.add(line);
  }

  animate() {
    const elapsedTime = this.clock.getElapsedTime();

    // Erde bewegt sich um die Sonne
    this.earth.position.x = this.earthOrbitRadius * Math.cos(elapsedTime / this.earthOrbitTime * 2 * Math.PI);
    this.earth.position.z = this.earthOrbitRadius * Math.sin(elapsedTime / this.earthOrbitTime * 2 * Math.PI);

    // Mond bewegt sich um die Erde
    this.moon.position.x = this.earth.position.x + this.moonOrbitRadius * Math.cos(elapsedTime / this.moonOrbitTime * 2 * Math.PI);
    this.moon.position.z = this.earth.position.z + this.moonOrbitRadius * Math.sin(elapsedTime / this.moonOrbitTime * 2 * Math.PI);

    // Jupiter bewegt sich um die Sonne
    this.jupiter.position.x = this.jupiterOrbitRadius * Math.cos(elapsedTime / this.jupiterOrbitTime * 2 * Math.PI);
    this.jupiter.position.z = this.jupiterOrbitRadius * Math.sin(elapsedTime / this.jupiterOrbitTime * 2 * Math.PI);

    // Saturn bewegt sich um die Sonne
    this.saturn.position.x = this.saturnOrbitRadius * Math.cos(elapsedTime / this.saturnOrbitTime * 2 * Math.PI);
    this.saturn.position.z = this.saturnOrbitRadius * Math.sin(elapsedTime / this.saturnOrbitTime * 2 * Math.PI);

    this.renderer.render(this.scene, this.camera);
  }
}
