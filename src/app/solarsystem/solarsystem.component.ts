import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { AmbientLight, Camera, Clock, DirectionalLight, Mesh, MeshBasicMaterial, MeshLambertMaterial, PerspectiveCamera, PointLight, Scene, SphereGeometry, WebGLRenderer } from 'three';

@Component({
  selector: 'app-solarsystem',
  templateUrl: './solarsystem.component.html',
  styleUrls: ['./solarsystem.component.scss'],
})

export class SolarsystemComponent implements OnInit, AfterViewInit {
  @ViewChild('threejs')
  canvas!: ElementRef<HTMLCanvasElement>;
  scene!: Scene;
  camera!: PerspectiveCamera;
  renderer!: WebGLRenderer;
  clock = new Clock();
  controls!: OrbitControls;
  sun!: Mesh;
  earth!: Mesh;
  moon!: Mesh;

  constructor() {}

  ngOnInit() {}

  ngAfterViewInit() {
    // Initialize the scene
    this.scene = new Scene();

    // Set up the camera with a suitable aspect ratio, near and far planes
    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(30, 30, 30); // Position the camera away from the scene
    this.camera.lookAt(0, 0, 0); // Make sure the camera is pointing towards the center of the scene

    // Set up the renderer and attach it to the canvas
    this.renderer = new WebGLRenderer({ canvas: this.canvas.nativeElement }); // ERROR ------------------------------------!!!!
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;

    // Add ambient light to brighten the entire scene
    const ambientLight = new AmbientLight(0x404040, 1); // Soft white light
    this.scene.add(ambientLight);
    console.log("added ambient Light");

    // Add a directional light to simulate sunlight
    const directionalLight = new DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 10, 10); // Place the light
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
    console.log("added dire Light");

    // Create the Sun (Yellow sphere)
    const sunGeometry = new SphereGeometry(5, 32, 32);
    const sunMaterial = new MeshBasicMaterial({ color: 0xffcc00 }); // Basic material does not need light
    this.sun = new Mesh(sunGeometry, sunMaterial);
    this.sun.position.set(0, 0, 0);
    this.scene.add(this.sun);
    console.log("added sun Light");

    // Create Earth (Green sphere)
    const earthGeometry = new SphereGeometry(1, 32, 32);
    const earthMaterial = new MeshLambertMaterial({ color: 0x00ff00 }); // Lambert material reacts to lighting
    this.earth = new Mesh(earthGeometry, earthMaterial);
    this.earth.position.set(10, 0, 0);
    this.scene.add(this.earth);

    // Create Moon (Gray sphere)
    const moonGeometry = new SphereGeometry(0.27, 16, 16);
    const moonMaterial = new MeshBasicMaterial({ color: 0x888888 }); // Lambert material reacts to lighting
    this.moon = new Mesh(moonGeometry, moonMaterial);
    this.moon.position.set(2, 0, 0);
    this.earth.add(this.moon); // Attach the moon to Earth

    // Add orbit controls to allow user interaction with the camera
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;


    // Start the animation loop
    this.renderer.setAnimationLoop(() => this.animate());

    // Resize the renderer when the window size changes
    window.addEventListener('resize', () => this.onResize());
  }

  animate() {
    const elapsedTime = this.clock.getDelta();

    // Rotate the Sun
    this.sun.rotation.y += 0.005 * elapsedTime;

    // Rotate Earth around the Sun
    this.earth.rotation.y += 0.01 * elapsedTime;

    // Rotate the Moon around the Earth
    this.moon.rotation.y += 0.05 * elapsedTime;

    // Render the scene
    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    // Adjust camera aspect ratio and update the projection matrix
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    // Resize the renderer
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
