import * as THREE from 'three';
import React, { useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { GLTF } from 'three-stdlib';

type GLTFResult = GLTF & {
  nodes: {
    polySurface6_RED_0: THREE.Mesh;
    glass: THREE.Mesh;
    tube: THREE.Mesh;
    polySurface7_RED_0: THREE.Mesh;
    door: THREE.Mesh;
    pCube1_lambert1_0: THREE.Mesh;
    ['switch']: THREE.Mesh;
    pCylinder2_lambert1_0: THREE.Mesh;
    pCube3_RED_0: THREE.Mesh;
  };
  materials: {
    material: THREE.MeshPhysicalMaterial;
    glass: THREE.MeshPhysicalMaterial;
    lambert1: THREE.MeshStandardMaterial;
    WHITE: THREE.MeshStandardMaterial;
  };
};

type ActionName = 'doorAction' | 'switchAction';
type GLTFActions = Record<ActionName, THREE.AnimationAction>;

export function GumBallMachine(props: JSX.IntrinsicElements['group']) {
  const group = useRef<THREE.Group>();
  const { nodes, materials, animations } = useGLTF(
    '/gumball-machine.glb'
  ) as GLTFResult;
  const { actions } = useAnimations<GLTFActions>(animations, group);
  return (
    <group ref={group} {...props} dispose={null}>
      <group name='Scene'>
        <mesh
          name='polySurface6_RED_0'
          castShadow
          receiveShadow
          geometry={nodes.polySurface6_RED_0.geometry}
          material={materials.material}
          position={[0, -3.907, 0.019]}
        />
        <mesh
          name='glass'
          castShadow
          receiveShadow
          geometry={nodes.glass.geometry}
          material={materials.glass}
          position={[0, -3.48, 0.019]}
        />
        <mesh
          name='tube'
          castShadow
          receiveShadow
          geometry={nodes.tube.geometry}
          material={materials.lambert1}
          position={[0, -3.48, 0.019]}
        />
        <mesh
          name='polySurface7_RED_0'
          castShadow
          receiveShadow
          geometry={nodes.polySurface7_RED_0.geometry}
          material={materials.material}
          position={[0, 0.564, 0.019]}
          scale={0.43}
        />
        <mesh
          name='door'
          castShadow
          receiveShadow
          geometry={nodes.door.geometry}
          material={materials.lambert1}
          position={[0, 0.463, -0.403]}
          rotation={[0.02, 0, 0]}
          scale={0.43}
        />
        <mesh
          name='pCube1_lambert1_0'
          castShadow
          receiveShadow
          geometry={nodes.pCube1_lambert1_0.geometry}
          material={materials.lambert1}
          position={[0, 0.678, -0.358]}
          scale={[0.347, 0.347, 0.109]}
        />
        <mesh
          name='switch'
          castShadow
          receiveShadow
          geometry={nodes['switch'].geometry}
          material={materials.WHITE}
          position={[0, 0.678, -0.479]}
          scale={[0.255, 0.065, 0.072]}
        />
        <mesh
          name='pCylinder2_lambert1_0'
          castShadow
          receiveShadow
          geometry={nodes.pCylinder2_lambert1_0.geometry}
          material={materials.lambert1}
          position={[0, 0.682, -0.433]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[0.025, 0.018, 0.025]}
        />
        <mesh
          name='pCube3_RED_0'
          castShadow
          receiveShadow
          geometry={nodes.pCube3_RED_0.geometry}
          material={materials.material}
          position={[0, 0.025, 0.019]}
          scale={[0.598, 0.073, 0.598]}
        />
      </group>
    </group>
  );
}

useGLTF.preload('/gumball-machine.glb');
