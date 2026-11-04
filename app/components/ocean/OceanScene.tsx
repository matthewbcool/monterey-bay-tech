'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  MathUtils,
  Mesh,
  MeshToonMaterial,
} from 'three';
import { createSardineSchool } from './cozy/sardine/createSardineSchool';
import { createMoonJelly, updateMoonJelly } from './cozy/moon-jelly/createMoonJelly';
import { createGiantKelp } from './cozy/giantKelp';
import { disposeObject } from './cozy/props';

interface OceanSceneProps {
  paused: boolean;
  compact: boolean;
  onReady?: () => void;
}

interface JellySlot {
  position: [number, number, number];
  scale: number;
  phase: number;
}

interface KelpSlot {
  position: [number, number, number];
  height: number;
  rotation: number;
}

// The school sweeps right to left across the open water, so the copy keeps the
// left third of the frame clear.
const SCHOOL = {
  startX: -1.2,
  endX: 9.5,
  y: 0.55,
  z: 1.1,
  scale: 2.35,
  speed: 0.52,
};

const JELLIES: JellySlot[] = [
  { position: [-1.1, -0.55, 1.5], scale: 3.6, phase: 0.4 },
  { position: [1.5, -1.35, 0.9], scale: 2.9, phase: 2.6 },
  { position: [3.35, 0.65, 0.2], scale: 3.2, phase: 4.1 },
  { position: [-2.4, -1.8, -0.2], scale: 2.5, phase: 5.2 },
];

const KELP: KelpSlot[] = [
  { position: [-4.8, -3.2, -1.4], height: 5.1, rotation: 0.4 },
  { position: [-3.3, -3.2, -3.8], height: 4.6, rotation: 1.7 },
  { position: [-0.9, -3.2, -4.6], height: 5.4, rotation: 3.1 },
  { position: [1.3, -3.2, -4.2], height: 4.4, rotation: 4.4 },
  { position: [3.2, -3.2, -2.6], height: 4.9, rotation: 5.6 },
  { position: [5.3, -3.2, -4.8], height: 4.3, rotation: 2.3 },
];

const JELLY_GLOW = new Color('#2f97a6');

function MarineSnow({ count = 140 }: { count?: number }) {
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    let seed = 1337;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (random() - 0.5) * 16;
      positions[i * 3 + 1] = (random() - 0.5) * 9;
      positions[i * 3 + 2] = (random() - 0.5) * 9 - 1;
    }

    const buffer = new BufferGeometry();
    buffer.setAttribute('position', new Float32BufferAttribute(positions, 3));
    return buffer;
  }, [count]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const ref = useRef<Group>(null);

  useFrame((state, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.012;
  });

  return (
    <group ref={ref}>
      <points geometry={geometry}>
        <pointsMaterial
          color='#cfeeef'
          size={0.035}
          sizeAttenuation
          transparent
          opacity={0.45}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

function MarineLife({ paused, compact }: { paused: boolean; compact: boolean }) {
  const jellies = useMemo(
    () => {
      const slots = JELLIES.slice(0, compact ? 2 : 3);
      return slots.map((slot, index) => {
        const root = createMoonJelly({ diameterMeters: 0.26, seed: 41 + index * 7 });

        // The bell is authored at 22% opacity, which disappears against a dark
        // hero. Lift it just enough to read, and add a faint self-glow.
        root.traverse((object) => {
          if (!(object instanceof Mesh)) return;
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];

          materials.forEach((material) => {
            if (!(material instanceof MeshToonMaterial)) return;
            material.transparent = true;
            material.opacity = Math.max(material.opacity, 0.6);
            material.emissive = JELLY_GLOW.clone();
            material.emissiveIntensity = 0.95;
          });
        });

        return { slot, root };
      });
    },
    [compact]
  );

  const kelp = useMemo(
    () =>
      KELP.slice(0, compact ? 4 : KELP.length).map((slot, index) => {
        const root = createGiantKelp({
          height: slot.height,
          fronds: 3,
          canopy: 1.1,
          bladeSpacing: 0.44,
          seed: 21 + index * 13,
        });

        // Lift the olive blades out of the teal water without repainting them.
        root.traverse((object) => {
          if (!(object instanceof Mesh)) return;
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];

          materials.forEach((material) => {
            if (!(material instanceof MeshToonMaterial)) return;
            material.emissive = new Color('#1d3f22');
            material.emissiveIntensity = 0.45;
          });
        });

        return { slot, root };
      }),
    [compact]
  );

  // One instanced draw for the whole school: 256 slots of shared geometry with
  // per-instance morph weights, so the count is cheap.
  const school = useMemo(
    () =>
      createSardineSchool({
        count: compact ? 110 : 190,
        capacity: 256,
        lengthMeters: 0.25,
      }),
    [compact]
  );

  const travelX = useRef(SCHOOL.startX);

  // Factories own their geometry and materials, so release them on unmount.
  useEffect(
    () => () => {
      school.dispose();
      jellies.forEach(({ root }) => disposeObject(root));
      kelp.forEach(({ root }) => disposeObject(root));
    },
    [school, jellies, kelp]
  );

  useFrame((state, delta) => {
    if (paused) return;

    const dt = Math.min(delta, 0.05);
    const time = state.clock.elapsedTime;

    school.update(dt);
    travelX.current += dt * SCHOOL.speed;
    if (travelX.current > SCHOOL.endX) travelX.current = SCHOOL.startX;

    school.root.position.set(
      travelX.current,
      SCHOOL.y + Math.sin(time * 0.21) * 0.12,
      SCHOOL.z
    );
    // Head is -X, so the school faces its direction of travel.
    school.root.rotation.y = Math.PI;
    school.root.rotation.z = Math.sin(time * 0.19) * 0.03;

    jellies.forEach(({ root, slot }, index) => {
      updateMoonJelly(root, dt);
      const sway = Math.sin(time * 0.22 + slot.phase);
      root.position.y = slot.position[1] + sway * 0.18;
      root.position.x = slot.position[0] + Math.cos(time * 0.16 + slot.phase) * 0.12;
      root.rotation.z = sway * 0.06;
      root.rotation.y += dt * 0.05 * (index % 2 === 0 ? 1 : -1);
    });

    kelp.forEach(({ root, slot }, index) => {
      root.rotation.z =
        slot.rotation * 0.003 + Math.sin(time * 0.19 + index) * 0.012;
    });
  });

  return (
    <group>
      {kelp.map(({ root, slot }, index) => (
        <primitive
          key={`kelp-${index}`}
          object={root}
          position={slot.position}
          rotation={[0, slot.rotation, 0]}
        />
      ))}

      {jellies.map(({ root, slot }, index) => (
        <primitive
          key={`jelly-${index}`}
          object={root}
          position={slot.position}
          scale={slot.scale}
        />
      ))}

      <primitive
        object={school.root}
        position={[SCHOOL.startX, SCHOOL.y, SCHOOL.z]}
        rotation={[0, Math.PI, 0]}
        scale={SCHOOL.scale}
      />

      <MarineSnow count={compact ? 80 : 150} />
    </group>
  );
}

/** Very small pointer parallax; only runs on fine pointers and when motion is allowed. */
function CameraRig({ enabled }: { enabled: boolean }) {
  useFrame((state, delta) => {
    if (!enabled) return;
    const { camera, pointer } = state;
    camera.position.x = MathUtils.damp(camera.position.x, pointer.x * 0.5, 1.6, delta);
    camera.position.y = MathUtils.damp(camera.position.y, 1.05 + pointer.y * 0.28, 1.6, delta);
    camera.lookAt(0, 0.45, 0);
  });

  return null;
}

const OceanScene: React.FC<OceanSceneProps> = ({ paused, compact, onReady }) => {
  const [parallax, setParallax] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setParallax(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return (
    <Canvas
      dpr={[1, compact ? 1.5 : 1.8]}
      camera={{ position: [0, 1.05, 7.6], fov: 42, near: 0.1, far: 60 }}
      gl={{
        alpha: true,
        antialias: !compact,
        powerPreference: 'high-performance',
      }}
      frameloop={paused ? 'demand' : 'always'}
      onCreated={({ gl }) => {
        gl.setClearAlpha(0);
        gl.toneMappingExposure = 1.35;
        onReady?.();
      }}
      aria-hidden='true'>
      <fogExp2 attach='fog' args={['#0b3a4d', 0.03]} />

      <ambientLight intensity={0.75} color='#9fe3e0' />
      <hemisphereLight args={['#d5eef7', '#1d4c4e', 2.1]} />
      <directionalLight position={[6, 9, 6]} intensity={3.2} color='#fff3dc' />
      <directionalLight position={[3.5, 5.5, 6.5]} intensity={2.4} color='#ffd9a8' />
      <directionalLight position={[6, 2.5, -6]} intensity={1.6} color='#9ff7df' />
      <directionalLight position={[-6, 3, -5]} intensity={2.1} color='#51ffcb' />
      <spotLight
        position={[1.5, 4.5, 5.5]}
        angle={0.7}
        penumbra={1}
        intensity={40}
        distance={18}
        color='#ffe9c9'
      />
      <pointLight position={[2, -1.5, 3]} intensity={26} color='#2fd9c4' distance={12} />

      <MarineLife paused={paused} compact={compact} />
      <CameraRig enabled={parallax && !paused} />
    </Canvas>
  );
};

export default OceanScene;
