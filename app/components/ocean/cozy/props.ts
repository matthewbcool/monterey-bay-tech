/**
 * Subset of `src/models/props/primitives.ts` from Monterey Bay Cozy
 * (MIT, see ../ATTRIBUTION.md). Only the three helpers the kelp factory needs
 * are vendored so the hero does not pull in the full props catalogue.
 */
import {
  BufferGeometry,
  Material,
  Mesh,
  MeshStandardMaterial,
  Object3D,
} from 'three';

export const mat = (color: string, roughness = 0.8, metalness = 0) =>
  new MeshStandardMaterial({ color, roughness, metalness });

export function mesh(
  parent: Object3D,
  name: string,
  geometry: BufferGeometry,
  material: Material,
  x = 0,
  y = 0,
  z = 0
) {
  const m = new Mesh(geometry, material);
  m.name = name;
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

/** Releases geometry and materials owned by a factory root. */
export function disposeObject(root: Object3D) {
  const geometries = new Set<BufferGeometry>();
  const materials = new Set<Material>();

  root.traverse((object) => {
    if (object instanceof Mesh) {
      geometries.add(object.geometry);
      for (const material of Array.isArray(object.material)
        ? object.material
        : [object.material]) {
        materials.add(material);
      }
    }
  });

  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
  root.removeFromParent();
}
