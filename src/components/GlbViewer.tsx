import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF } from "@react-three/drei";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

interface GlbViewerProps {
  url: string;
}

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

export function GlbViewer({ url }: GlbViewerProps) {
  return (
    <div className="w-full h-[400px] rounded-lg border border-border bg-background/50 overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ width: "100%", height: "100%" }}
      >
        <Suspense
          fallback={
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="gray" wireframe />
            </mesh>
          }
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <directionalLight position={[-10, -10, -5]} intensity={0.5} />
          <Model url={url} />
          <Environment preset="studio" />
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            autoRotate={true}
            autoRotateSpeed={2}
            minDistance={2}
            maxDistance={10}
          />
        </Suspense>
      </Canvas>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground opacity-50" />
      </div>
    </div>
  );
}
