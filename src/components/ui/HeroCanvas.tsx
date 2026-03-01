import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

/* ────────────────────────────────────────────── */
/*  HERO — Network Grid + Floating Nodes         */
/* ────────────────────────────────────────────── */

/** Infinite-feeling dot grid that ripples outward */
function GridPlane() {
  const meshRef = useRef<THREE.Points>(null);
  const cols = 60;
  const rows = 60;
  const spacing = 0.45;

  const { positions, basePositions } = useMemo(() => {
    const count = cols * rows;
    const pos = new Float32Array(count * 3);
    const base = new Float32Array(count * 3);
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const idx = (i * rows + j) * 3;
        const x = (i - cols / 2) * spacing;
        const z = (j - rows / 2) * spacing;
        pos[idx] = x;
        pos[idx + 1] = 0;
        pos[idx + 2] = z;
        base[idx] = x;
        base[idx + 1] = 0;
        base[idx + 2] = z;
      }
    }
    return { positions: pos, basePositions: base };
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const geo = meshRef.current.geometry;
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const t = state.clock.getElapsedTime();

    for (let i = 0; i < cols * rows; i++) {
      const bx = basePositions[i * 3];
      const bz = basePositions[i * 3 + 2];
      const dist = Math.sqrt(bx * bx + bz * bz);
      // Smooth wave ripple
      posAttr.array[i * 3 + 1] =
        Math.sin(dist * 0.8 - t * 0.6) * 0.15 *
        Math.max(0, 1 - dist / 14);
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={meshRef} rotation={[-Math.PI / 2.8, 0, 0]} position={[0, -2, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={cols * rows}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#4f46e5"
        size={0.025}
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/** Connection lines between nearby nodes (network effect) */
function NetworkLines() {
  const lineRef = useRef<THREE.LineSegments>(null);

  const { positions } = useMemo(() => {
    const nodeCount = 50;
    const nodes: THREE.Vector3[] = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push(new THREE.Vector3(
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 10 - 2
      ));
    }

    const lineVerts: number[] = [];
    const maxDist = 4;
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        if (nodes[i].distanceTo(nodes[j]) < maxDist) {
          lineVerts.push(nodes[i].x, nodes[i].y, nodes[i].z);
          lineVerts.push(nodes[j].x, nodes[j].y, nodes[j].z);
        }
      }
    }
    return { positions: new Float32Array(lineVerts) };
  }, []);

  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.05) * 0.15;
    }
  });

  return (
    <lineSegments ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={positions.length / 3} />
      </bufferGeometry>
      <lineBasicMaterial color="#4f46e5" transparent opacity={0.06} blending={THREE.AdditiveBlending} />
    </lineSegments>
  );
}

/** Floating icosahedron nodes at key positions */
function FloatingNodes() {
  const groupRef = useRef<THREE.Group>(null);

  const nodes = useMemo(() => {
    return [
      { pos: [3.5, 1.5, -2] as [number, number, number], scale: 0.12, speed: 0.6 },
      { pos: [-4, -0.5, -1] as [number, number, number], scale: 0.1, speed: 0.8 },
      { pos: [1.5, -1.8, -3] as [number, number, number], scale: 0.08, speed: 1 },
      { pos: [-2, 2, -4] as [number, number, number], scale: 0.15, speed: 0.5 },
      { pos: [5, -1, -5] as [number, number, number], scale: 0.06, speed: 1.2 },
    ];
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => (
        <Float key={i} speed={node.speed} rotationIntensity={0.4} floatIntensity={0.8}>
          <mesh position={node.pos} scale={node.scale}>
            <icosahedronGeometry args={[1, 1]} />
            <meshBasicMaterial color="#818cf8" wireframe transparent opacity={0.35} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

/** Outer ambient particle dust */
function AmbientParticles({ count = 600 }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.008;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#6366f1"
        size={0.015}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.3}
      />
    </Points>
  );
}

/** Camera subtle drift */
function CameraDrift() {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 0, 12));

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    target.current.x = Math.sin(t * 0.1) * 0.3;
    target.current.y = Math.cos(t * 0.08) * 0.15;
    camera.position.lerp(target.current, 0.01);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export function HeroCanvas() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.15} />
        <pointLight position={[8, 8, 8]} intensity={0.6} color="#6366f1" />
        <pointLight position={[-8, -4, -8]} intensity={0.4} color="#0ea5e9" />
        <CameraDrift />
        <GridPlane />
        <NetworkLines />
        <FloatingNodes />
        <AmbientParticles />
      </Canvas>
    </div>
  );
}

/* ────────────────────────────────────────────── */
/*  FEATURES — Orbiting wireframe polyhedra       */
/* ────────────────────────────────────────────── */

function OrbitingShapes() {
  const group1 = useRef<THREE.Mesh>(null);
  const group2 = useRef<THREE.Mesh>(null);
  const group3 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group1.current) {
      group1.current.rotation.x = t * 0.3;
      group1.current.rotation.z = t * 0.2;
    }
    if (group2.current) {
      group2.current.rotation.y = t * 0.25;
      group2.current.rotation.x = t * 0.15;
    }
    if (group3.current) {
      group3.current.rotation.z = t * 0.2;
      group3.current.rotation.y = t * 0.3;
    }
  });

  return (
    <group>
      <Float speed={0.8} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh ref={group1} position={[-3, 1.5, 0]} scale={0.6}>
          <octahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color="#4f46e5" wireframe transparent opacity={0.15} />
        </mesh>
      </Float>
      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.6}>
        <mesh ref={group2} position={[3, -1, -1]} scale={0.4}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color="#0ea5e9" wireframe transparent opacity={0.12} />
        </mesh>
      </Float>
      <Float speed={0.6} rotationIntensity={0.15} floatIntensity={0.4}>
        <mesh ref={group3} position={[0, 0, -2]} scale={0.8}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial color="#6366f1" wireframe transparent opacity={0.08} />
        </mesh>
      </Float>
    </group>
  );
}

export function FeaturesCanvas() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.1} />
        <pointLight position={[5, 5, 5]} intensity={0.4} color="#6366f1" />
        <OrbitingShapes />
      </Canvas>
    </div>
  );
}
