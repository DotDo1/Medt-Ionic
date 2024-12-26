// moon.ts
import * as THREE from 'three';

class Moon {
  private sphere: THREE.Mesh;
  private material: THREE.MeshBasicMaterial;
  private orbitRadius: number;
  private planetPosition: THREE.Vector3;

  constructor(radius: number, color: number, orbitRadius: number, planetPosition: THREE.Vector3) {
    // Create geometry for the moon (a smaller sphere)
    const geometry = new THREE.SphereGeometry(radius, 16, 16); // Using BufferGeometry
    this.material = new THREE.MeshBasicMaterial({ color: color });
    
    // Create the moon mesh
    this.sphere = new THREE.Mesh(geometry, this.material);
    
    // Set orbit radius and planet position
    this.orbitRadius = orbitRadius;
    this.planetPosition = planetPosition;
    
    // Position the moon at the correct initial orbit position
    this.updatePosition(0);
  }

  // Method to update the moon's position as it orbits around the planet
  public update(deltaTime: number): void {
    // Update the moon's orbit angle (this creates the orbit effect)
    const angle = deltaTime * 0.1; // Adjust speed of orbit here
    this.updatePosition(angle);
  }

  // Method to update the moon's position based on the current orbit angle
  private updatePosition(angle: number): void {
    // Set the moon's position relative to the planet's position
    this.sphere.position.x = this.planetPosition.x + this.orbitRadius * Math.cos(angle);
    this.sphere.position.z = this.planetPosition.z + this.orbitRadius * Math.sin(angle);
    this.sphere.position.y = this.planetPosition.y; // Keep the moon's Y position the same
  }

  // Get the moon's mesh to add it to the scene
  public getMesh(): THREE.Mesh {
    return this.sphere;
  }
}

export default Moon;
