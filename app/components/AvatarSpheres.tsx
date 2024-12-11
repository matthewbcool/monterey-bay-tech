import React, { useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import {
  Environment,
  Lightformer,
  useTexture,
  Decal,
  Billboard,
  Text,
} from '@react-three/drei';
import {
  Physics,
  RigidBody,
  BallCollider,
  CuboidCollider,
} from '@react-three/rapier';

interface Avatar {
  url: string;
  username: string;
}

interface AvatarSpheresProps {
  avatars?: Avatar[];
}

export default function AvatarSpheres({ avatars = [] }: AvatarSpheresProps) {
  return (
    <Canvas
      shadows
      orthographic
      camera={{ position: [0, 0, 10], zoom: 180 }}
      style={{ height: '480px' }}>
      <ambientLight intensity={Math.PI} />
      <spotLight decay={0} position={[5, 10, 2.5]} angle={0.2} castShadow />
      <Physics>
        {avatars.filter(Boolean).map((avatar, i) => (
          <SphereWithDecal
            key={i}
            avatar={avatar.url}
            username={avatar.username}
            position={[Math.random(), 10 + Math.random() * 10, 0]}
          />
        ))}
        <Walls />
      </Physics>
      <Environment>
        <Lightformer
          form='rect'
          intensity={4}
          position={[15, 10, 10]}
          scale={20}
          onUpdate={(self) => self.lookAt(0, 0, 0)}
        />
        <Lightformer
          intensity={2}
          position={[-10, 0, -20]}
          scale={[10, 100, 1]}
          onUpdate={(self) => self.lookAt(0, 0, 0)}
        />
      </Environment>
    </Canvas>
  );
}

function SphereWithDecal({
  avatar,
  username,
  ...props
}: {
  avatar: string;
  username: string;
  position: [number, number, number];
}) {
  const api = useRef<any>();
  const texture = useTexture(avatar);
  return (
    <RigidBody
      colliders={false}
      ref={api}
      enabledRotations={[true, true, true]} // Lock rotations to Z-axis
      enabledTranslations={[true, true, false]}
      linearDamping={1}
      angularDamping={1}
      restitution={0.5}
      {...props}>
      <BallCollider args={[0.48]} />
      <mesh
        castShadow
        receiveShadow
        rotation={[Math.PI, 0, 0]} // Rotate 180 degrees around the X-axis
        onClick={() => {
          api.current.applyImpulse({ x: 0, y: 2, z: 0 }, true);
          api.current.applyTorqueImpulse(
            {
              x: Math.random() / 2,
              y: Math.random() / 2,
              z: Math.random() / 2,
            },
            true
          );
        }}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial
          color={`hsl(${Math.random() * 360}, 100%, 50%)`}
        />
        <Decal position={[0, 0, 0.5]} scale={0.4} map={texture} />
        <Decal position={[0, 0, -0.5]} scale={0.4} map={texture} />
        <Decal position={[0, -0.5, 0]} scale={0.4} map={texture} />
        <Decal position={[0, 0.5, 0]} scale={0.4} map={texture} />
        <Decal position={[-0.5, 0, 0]} scale={0.4} map={texture} />
        <Decal position={[0.5, 0, 0]} scale={0.4} map={texture} />
        <Billboard
          follow={true}
          lockX={false}
          lockY={false}
          lockZ={true} // Lock the rotation on the z axis (default=false)
        >
          <Text
            position={[0, -0.6, 0]}
            fontSize={0.1}
            color='white'
            outlineColor='black'
            outlineWidth={0.02}
            anchorX='center'
            anchorY='middle'>
            {username}
          </Text>
        </Billboard>
      </mesh>
    </RigidBody>
  );
}

function Walls() {
  const { width, height } = useThree((state) => state.viewport);
  return (
    <>
      <CuboidCollider
        position={[0, -height / 2 - 1, 0]}
        args={[width / 2, 1, 1]}
      />
      <CuboidCollider
        position={[-width / 2 - 1, 0, 0]}
        args={[1, height * 10, 10]}
      />
      <CuboidCollider
        position={[width / 2 + 1, 0, 0]}
        args={[1, height * 10, 1]}
      />
    </>
  );
}
