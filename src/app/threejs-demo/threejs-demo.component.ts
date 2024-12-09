import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RangeCustomEvent } from '@ionic/angular';
import { AmbientLight, BoxGeometry, BufferAttribute, BufferGeometry, Clock, Mesh, MeshBasicMaterial, MeshPhysicalMaterial, MeshStandardMaterial, PerspectiveCamera, PointLight, Scene, SpotLight, Texture, TextureLoader, WebGLRenderer } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

@Component({
  selector: 'app-three-jsdemo',
  templateUrl: './threejs-demo.component.html',
  styleUrls: ['./threejs-demo.component.scss'],
})

export class ThreejsDemoComponent implements OnInit, AfterViewInit {
  @ViewChild('threejs')
  canvas!: ElementRef<HTMLCanvasElement>;
  scene!: Scene;
  camera!: PerspectiveCamera;
  renderer!: WebGLRenderer;
  cube!: Mesh<BoxGeometry, MeshStandardMaterial>
  rotationspeed = 0;
  clock = new Clock();
  map!: Mesh;
  

  constructor() { }

  ngOnInit() { }

  ngAfterViewInit() {
    //alles inizialisieren
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new WebGLRenderer({ canvas: this.canvas.nativeElement, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
  
    const loader = new TextureLoader();
    loader.load('assets/maps/heightmap.png', (texture: Texture) => this.onTextureLoaded(texture));
    const normalMap = loader.load('assets/maps/NormalMap.png');


    const geometry = new BoxGeometry(1, 1, 1);
    const material = new MeshStandardMaterial({ color: 0xffff00, normalMap: normalMap});
    this.cube = new Mesh(geometry, material);
    this.cube.position.set(-5, 5, -5);

    this.cube.castShadow = true;

    this.scene.add(this.cube);
  
    this.camera.position.set(1, 20, -15);
    this.camera.lookAt(0, 0, 0);
  

    // Ambient Light

    const light = new AmbientLight('0xffffff',0.1);
    this.scene.add(light);

    // Point Light
    const pointLight = new PointLight(0xffffff,50,50,1)
    pointLight.position.set(-5,30,5);
    pointLight.castShadow = true;
    this.scene.add(pointLight);

    //animationLoop starten
    this.renderer.setAnimationLoop(() => this.animate());
  }
  

  private onTextureLoaded(texture: Texture) {
    //texturen laden
    //console.log('Texture loaded');
    const canvas = document.createElement('canvas');
    canvas.width = texture.image.width;
    canvas.height = texture.image.height;

    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    //in context bild anzeigen
    context.drawImage(texture.image, 0, 0);

    //daten vom bild returnen
    const data = context.getImageData(0, 0, canvas.width, canvas.height);
    this.generateTerrain(data);
  }

  animate() {
    //es animiert/rotiert
    const elapsed = this.clock.getDelta();
    this.cube.rotation.x += (this.rotationspeed + 1) * 1 * elapsed;
    this.cube.rotation.y += (this.rotationspeed + 1) * 1 * elapsed;
    this.renderer.render(this.scene, this.camera);
  }

  onRotationSpeedChanged(event: Event) {
    //gibt rotationsgeschwindigkeit an
    const rangeEvent = event as RangeCustomEvent;
    this.rotationspeed = rangeEvent.detail.value as number;
  }

  private generateTerrain(imageData: ImageData) {
    //macht vertices und farben
    console.log(`imageData -> width: ${imageData.width} height: ${imageData.height}`);
    const colorInfos = [[0.38, 0.68, 0.3], [0.8, 0.8, 0.3], [0.99, 0.99, 0.99]];
    const vertices = [];

    const colors = [];
    //malt vertices an
    for (let z = 0; z < imageData.height; z++) {
      for (let x = 0; x < imageData.width; x++) {
        const index = x * 4 + z * imageData.width * 4;
        const y = imageData.data[index] / 255;
        vertices.push(x - imageData.width / 2);
        vertices.push(y * 5);
        vertices.push(z - imageData.height / 2);
        if (y <= 0.5) {
          colors.push(...colorInfos[0], 1);
        } else if (y > 0.5 && y <= 0.8) {
          colors.push(...colorInfos[1], 1);
        } else {
          colors.push(...colorInfos[2], 1);
        }
      }
    }
    //hat index von allen vertices
    const indices = [];
    //übergibt höhe und breite
    for (let j = 0; j < imageData.height - 1; j++) {
      const offset = j * imageData.width;
      for (let i = offset; i < offset + imageData.width - 1; i++) {
        indices.push(i);
        indices.push(i + imageData.width);
        indices.push(i + 1);

        indices.push(i + 1);
        indices.push(i + imageData.width);
        indices.push(i + 1 + imageData.width);
      }
    }
    //darstellen der map
    const geometry = new BufferGeometry();
    //index wird zu index von map
    geometry.setIndex(indices);
    //position wird zu position von map
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
    //farbe wird zu farbe von map
    geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 4));

    geometry.computeVertexNormals();


    const controls = new OrbitControls(this.camera, this.renderer.domElement)
    controls.enableDamping = true
    
    //material
    const material = new MeshPhysicalMaterial();
    //verfärben
    material.vertexColors = true;
    //nicht ausgefüllt
    material.wireframe = false;
    material.flatShading = true;

    //Mesh erstellen
    this.map = new Mesh(geometry, material);


    // Shadow
    this.map.receiveShadow = true;
    this.map.castShadow = false;

    //Mesh in scene einfügen
    this.scene.add(this.map);

  }

}