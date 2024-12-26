// planets.ts
import * as THREE from 'three';

class Planet {
  private sphere: THREE.Mesh;
  private material: THREE.MeshStandardMaterial;
  public name: string; // Add name
  public info: string; // Add info

  constructor(name: string, info: string, radius: number, color: number, position: THREE.Vector3) {
    this.name = name;
    this.info = info;
    // Use THREE.SphereGeometry, which uses BufferGeometry internally
    const geometry = new THREE.SphereGeometry(radius, 32, 32); // BufferGeometry
    this.material = new THREE.MeshStandardMaterial({ color: color });
    
    // Create the mesh with geometry and material
    this.sphere = new THREE.Mesh(geometry, this.material);
    
    // Set the position of the planet
    this.sphere.position.set(position.x, position.y, position.z);
  }

  // Method to get the planet's mesh for adding to the scene
  public getMesh(): THREE.Mesh {
    return this.sphere;
  }

  // Update the planet's properties, like rotation
  public update(): void {
    // For example, rotate the planet around the Y-axis
    this.sphere.rotation.y += 0.01;
  }
}

export default Planet;
