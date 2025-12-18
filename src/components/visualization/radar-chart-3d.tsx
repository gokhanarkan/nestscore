import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import type { CategoryScore } from "@/types";
import { CATEGORIES } from "@/lib/constants";

interface RadarChart3DProps {
  scores: CategoryScore[];
  size?: number;
  animate?: boolean;
  className?: string;
}

function RadarMesh({ scores, animate }: { scores: CategoryScore[]; animate: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const lineRef = useRef<THREE.LineLoop>(null);

  const categories = CATEGORIES.filter((c) => c.defaultWeight > 0);
  const count = categories.length;

  const { shape, outline, labels } = useMemo(() => {
    const angleStep = (Math.PI * 2) / count;
    const radius = 2;

    const shapePoints: THREE.Vector3[] = [];
    const outlinePoints: THREE.Vector3[] = [];
    const labelData: { position: THREE.Vector3; text: string; score: number }[] = [];

    categories.forEach((category, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const categoryScore = scores.find((s) => s.categoryId === category.id);
      const value = (categoryScore?.score ?? 0) / 100;
      const r = Math.max(0.1, value * radius);

      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      shapePoints.push(new THREE.Vector3(x, 0, z));

      const ox = Math.cos(angle) * radius;
      const oz = Math.sin(angle) * radius;
      outlinePoints.push(new THREE.Vector3(ox, 0, oz));

      const lx = Math.cos(angle) * (radius + 0.5);
      const lz = Math.sin(angle) * (radius + 0.5);
      labelData.push({
        position: new THREE.Vector3(lx, 0, lz),
        text: category.name.split(" ")[0],
        score: categoryScore?.score ?? 0,
      });
    });

    const shapeGeometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    for (let i = 1; i < shapePoints.length - 1; i++) {
      positions.push(shapePoints[0].x, shapePoints[0].y, shapePoints[0].z);
      positions.push(shapePoints[i].x, shapePoints[i].y, shapePoints[i].z);
      positions.push(shapePoints[i + 1].x, shapePoints[i + 1].y, shapePoints[i + 1].z);
    }
    positions.push(shapePoints[0].x, shapePoints[0].y, shapePoints[0].z);
    positions.push(shapePoints[shapePoints.length - 1].x, shapePoints[shapePoints.length - 1].y, shapePoints[shapePoints.length - 1].z);
    positions.push(shapePoints[1].x, shapePoints[1].y, shapePoints[1].z);

    shapeGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    shapeGeometry.computeVertexNormals();

    const outlineGeometry = new THREE.BufferGeometry().setFromPoints([...outlinePoints, outlinePoints[0]]);

    return { shape: shapeGeometry, outline: outlineGeometry, labels: labelData };
  }, [scores, count, categories]);

  useFrame((state) => {
    if (animate && meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <group>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map((scale) => (
        <lineLoop key={scale} args={[outline]}>
          <lineBasicMaterial color="#e5e5e5" opacity={0.3} transparent />
          <primitive object={outline.clone()} scale={scale} />
        </lineLoop>
      ))}

      {/* Axis lines */}
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i * Math.PI * 2) / count - Math.PI / 2;
        const x = Math.cos(angle) * 2;
        const z = Math.sin(angle) * 2;
        return (
          <line key={i}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[new Float32Array([0, 0, 0, x, 0, z]), 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#d4d4d4" />
          </line>
        );
      })}

      {/* Score shape */}
      <mesh ref={meshRef} geometry={shape}>
        <meshStandardMaterial
          color="#007aff"
          opacity={0.6}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Score outline */}
      <lineLoop ref={lineRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array(
                categories.flatMap((category, i) => {
                  const angle = (i * Math.PI * 2) / count - Math.PI / 2;
                  const categoryScore = scores.find((s) => s.categoryId === category.id);
                  const value = (categoryScore?.score ?? 0) / 100;
                  const r = Math.max(0.1, value * 2);
                  return [Math.cos(angle) * r, 0, Math.sin(angle) * r];
                })
              ),
              3,
            ]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#007aff" linewidth={2} />
      </lineLoop>

      {/* Labels */}
      {labels.map((label, i) => (
        <Text
          key={i}
          position={label.position}
          fontSize={0.25}
          color="#666"
          anchorX="center"
          anchorY="middle"
          rotation={[-Math.PI / 2, 0, 0]}
        >
          {label.text}
        </Text>
      ))}
    </group>
  );
}

export function RadarChart3D({ scores, size = 300, animate = true, className }: RadarChart3DProps) {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <Canvas
        camera={{ position: [0, 4, 4], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <RadarMesh scores={scores} animate={animate} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.5}
          autoRotate={animate}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
