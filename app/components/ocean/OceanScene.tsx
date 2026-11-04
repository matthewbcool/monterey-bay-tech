'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  MathUtils,
  Mesh,
  MeshToonMaterial,
  PMREMGenerator,
  Vector3,
  type PerspectiveCamera,
} from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { createSardineSchool } from './cozy/sardine/createSardineSchool';
import { createMoonJelly, updateMoonJelly } from './cozy/moon-jelly/createMoonJelly';
import { createGiantKelp } from './cozy/giantKelp';
import { disposeObject } from './cozy/props';

interface OceanSceneProps {
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

const SCHOOL = {
  y: 0.45,
  z: 0.9,
  scale: 2.2,
  /** World units per second, so fish cross the hero at a steady drift. */
  speed: 0.85,
  count: { full: 190, compact: 110 },
};

const JELLIES: JellySlot[] = [
  { position: [-1.4, -0.55, 1.5], scale: 3.6, phase: 0.4 },
  { position: [2.1, -1.35, 0.9], scale: 2.9, phase: 2.6 },
  { position: [4.4, 0.85, 0.2], scale: 3.2, phase: 4.1 },
];

const KELP: KelpSlot[] = [
  { position: [-5.6, -3.2, -1.4], height: 5.1, rotation: 0.4 },
  { position: [-3.6, -3.2, -3.8], height: 4.6, rotation: 1.7 },
  { position: [-0.9, -3.2, -4.6], height: 5.4, rotation: 3.1 },
  { position: [1.6, -3.2, -4.2], height: 4.4, rotation: 4.4 },
  { position: [3.6, -3.2, -2.6], height: 4.9, rotation: 5.6 },
  { position: [6.1, -3.2, -4.8], height: 4.3, rotation: 2.3 },
];

const JELLY_GLOW = new Color('#2f97a6');

/**
 * A 256×128 equirect HDR authored for this page (scripts/make-bay-env.mjs),
 * blurred into an environment map. It gives the fish and jellies reflection and
 * ambient bounce that flat directional lights cannot, at 128 kB instead of the
 * multi-megabyte sky HDRs a stock asset would cost.
 */
function BayEnvironment() {
  const hdr = useLoader(RGBELoader, '/assets/bay-env.hdr');
  const { gl, scene } = useThree();

  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const environment = pmrem.fromEquirectangular(hdr).texture;
    scene.environment = environment;
    scene.environmentIntensity = 0.62;
    pmrem.dispose();
    hdr.dispose();

    return () => {
      scene.environment = null;
      environment.dispose();
    };
  }, [hdr, gl, scene]);

  return null;
}

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
          opacity={0.4}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

/**
 * Two schools, 190 fish each on desktop. Every fish wraps individually across
 * the full canvas width, so the current never restarts: a sardine leaving the
 * right edge reappears at the left mid-stroke and keeps swimming.
 */
function SardineSchools({ compact }: { compact: boolean }) {
  const { size, gl, camera } = useThree();
  const perSchool = compact ? SCHOOL.count.compact : SCHOOL.count.full;

  const schools = useMemo(
    () =>
      [0, 1].map((index) =>
        createSardineSchool({
          count: perSchool,
          capacity: 256,
          lengthMeters: 0.25,
          seed: 7 + index * 16,
          wrapWidth: 10,
        })
      ),
    [perSchool]
  );

  const travel = useRef(0);
  const pointer = useRef({ x: 0, y: 0, active: false });
  const world = useMemo(() => new Vector3(), []);

  useEffect(() => () => schools.forEach((school) => school.dispose()), [schools]);

  // The hero's copy and scrims sit above the canvas, so listen on the window and
  // filter by the canvas rect; a listener on the canvas itself never fires.
  useEffect(() => {
    if (compact) return;
    const element = gl.domElement;

    const move = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      pointer.current.active = inside;
      if (!inside) return;

      pointer.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.current.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    };

    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [compact, gl]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    travel.current += dt * SCHOOL.speed;

    // Wrap exactly at the visible edge, so the seam is never on screen.
    const fov = ((state.camera as PerspectiveCamera).fov * Math.PI) / 180;
    const distance = Math.abs(state.camera.position.z - SCHOOL.z);
    const worldWidth = 2 * Math.tan(fov / 2) * distance * (size.width / size.height);
    const localWidth = Math.max(6, worldWidth / SCHOOL.scale + 1.5);
    const localTravel = travel.current / SCHOOL.scale;

    // Screen point on the school's plane, converted into local (pre-travel) space.
    let threatX = 0;
    let threatY = 0;
    if (pointer.current.active) {
      world
        .set(pointer.current.x, pointer.current.y, 0.5)
        .unproject(state.camera as PerspectiveCamera)
        .sub(state.camera.position)
        .normalize();
      const reach = (SCHOOL.z - state.camera.position.z) / world.z;
      threatX = -(state.camera.position.x + world.x * reach) / SCHOOL.scale;
      threatY = (state.camera.position.y + world.y * reach - SCHOOL.y) / SCHOOL.scale;
    }

    schools.forEach((school, index) => {
      const offset = localTravel + (index * localWidth) / 2;
      school.setWrapWidth(localWidth);
      school.setTravel(offset);
      // Fish are rendered at position − travel, so aim the cursor that far ahead.
      school.setThreat(threatX + offset, threatY, 0, pointer.current.active);
      school.update(dt);
    });
  });

  return (
    <group position={[0, SCHOOL.y, SCHOOL.z]}>
      {schools.map((school, index) => (
        <primitive
          key={index}
          object={school.root}
          rotation={[0, Math.PI, 0]}
          scale={SCHOOL.scale}
        />
      ))}
    </group>
  );
}

function MarineLife({ compact }: { compact: boolean }) {
  const jellies = useMemo(
    () =>
      JELLIES.slice(0, compact ? 2 : JELLIES.length).map((slot, index) => {
        const root = createMoonJelly({ diameterMeters: 0.26, seed: 41 + index * 7 });

        // The bell is authored at 22% opacity, which disappears against deep
        // water. Lift it, and give it a faint self-glow.
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
            material.emissiveIntensity = 0.7;
          });
        });

        return { slot, root };
      }),
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

        // The environment light does most of the work now; a little emissive
        // keeps the blades olive instead of grey.
        root.traverse((object) => {
          if (!(object instanceof Mesh)) return;
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];

          materials.forEach((material) => {
            if (!(material instanceof MeshToonMaterial)) return;
            material.emissive = new Color('#1d3f22');
            material.emissiveIntensity = 0.3;
          });
        });

        return { slot, root };
      }),
    [compact]
  );

  useEffect(
    () => () => {
      jellies.forEach(({ root }) => disposeObject(root));
      kelp.forEach(({ root }) => disposeObject(root));
    },
    [jellies, kelp]
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const time = state.clock.elapsedTime;

    jellies.forEach(({ root, slot }, index) => {
      updateMoonJelly(root, dt);
      const sway = Math.sin(time * 0.22 + slot.phase);
      root.position.y = slot.position[1] + sway * 0.18;
      root.position.x = slot.position[0] + Math.cos(time * 0.16 + slot.phase) * 0.12;
      root.rotation.z = sway * 0.06;
      root.rotation.y += dt * 0.05 * (index % 2 === 0 ? 1 : -1);
    });

    kelp.forEach(({ root, slot }, index) => {
      root.rotation.z = slot.rotation * 0.003 + Math.sin(time * 0.19 + index) * 0.012;
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

      <SardineSchools compact={compact} />
      <MarineSnow count={compact ? 80 : 150} />
    </group>
  );
}

/** Very small pointer parallax; fine pointers only. */
function CameraRig({ enabled }: { enabled: boolean }) {
  useFrame((state, delta) => {
    if (!enabled) return;
    const { camera, pointer } = state;
    camera.position.x = MathUtils.damp(camera.position.x, pointer.x * 0.5, 1.6, delta);
    camera.position.y = MathUtils.damp(camera.position.y, 1.05 + pointer.y * 0.28, 1.6, delta);
    camera.lookAt(0, 0.4, 0);
  });

  return null;
}

const OceanScene: React.FC<OceanSceneProps> = ({ compact, onReady }) => {
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
      gl={{ alpha: true, antialias: !compact, powerPreference: 'high-performance' }}
      frameloop='always'
      onCreated={({ gl }) => {
        gl.setClearAlpha(0);
        gl.toneMappingExposure = 0.92;
        onReady?.();
      }}
      aria-hidden='true'>
      <Suspense fallback={null}>
        <BayEnvironment />
      </Suspense>

      <fogExp2 attach='fog' args={['#07242f', 0.034]} />

      {/* Most of the light comes from the environment map now. A single warm key
          gives direction, and two dim colour lights keep the shapes readable
          without washing the water out. */}
      <directionalLight position={[5, 7, 6]} intensity={1.35} color='#ffeed2' />
      <directionalLight position={[-6, 2.5, -4]} intensity={0.75} color='#4be0c2' />
      <directionalLight position={[2, -3, 5]} intensity={0.25} color='#16505c' />

      <MarineLife compact={compact} />
      <CameraRig enabled={parallax} />
    </Canvas>
  );
};

export default OceanScene;
