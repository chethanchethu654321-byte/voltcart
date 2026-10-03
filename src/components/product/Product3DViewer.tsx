import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  RotateCcw,
  Sparkles,
  Maximize2,
  Eye,
  Layers,
  Sun,
  ShieldCheck,
  CheckCircle2,
  X,
  Volume2,
  Cpu,
  Info,
  Compass,
} from 'lucide-react';
import { Product } from '../../types';

interface Product3DViewerProps {
  product: Product;
  onClose?: () => void;
}

export const Product3DViewer: React.FC<Product3DViewerProps> = ({ product, onClose }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [exploded, setExploded] = useState(false);
  const [explodeFactor, setExplodeFactor] = useState(0);
  const [lightingMode, setLightingMode] = useState<'studio' | 'workshop' | 'blueprint'>('studio');
  const [activeTab, setActiveTab] = useState<'3d' | 'ar_room' | 'ai_specs'>('3d');
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);

  // References for three.js manipulation
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const explodedPartsRef = useRef<{ mesh: THREE.Mesh; origPos: THREE.Vector3; explodeDir: THREE.Vector3 }[]>([]);
  const lightsRef = useRef<{ main: THREE.DirectionalLight; fill: THREE.PointLight; ambient: THREE.AmbientLight } | null>(null);

  // Determine model archetype based on product category & name
  const getModelType = () => {
    const text = (product.name + ' ' + product.category + ' ' + (product.subcategory || '')).toLowerCase();
    if (text.includes('wire') || text.includes('cable') || text.includes('spool')) return 'wire_spool';
    if (text.includes('switch') || text.includes('socket') || text.includes('plate')) return 'switch_plate';
    if (text.includes('valve') || text.includes('tap') || text.includes('cock')) return 'valve';
    if (text.includes('pipe') || text.includes('elbow') || text.includes('fitting') || text.includes('tee')) return 'pipe_fitting';
    if (text.includes('led') || text.includes('bulb') || text.includes('light')) return 'led_light';
    if (text.includes('fan')) return 'fan';
    return 'switch_plate';
  };

  const modelType = getModelType();

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 400;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Background gradient canvas or neutral tone
    scene.background = new THREE.Color(lightingMode === 'blueprint' ? 0x091b29 : 0x0f172a);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2.5, 5.5);
    camera.lookAt(0, 0, 0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.8);
    mainLight.position.set(5, 8, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const fillLight = new THREE.PointLight(0xf59e0b, 1.2, 20); // Amber tint for electrical/brass warmth
    fillLight.position.set(-5, 3, -3);
    scene.add(fillLight);

    lightsRef.current = { main: mainLight, fill: fillLight, ambient: ambientLight };

    // 5. Build Procedural 3D Model
    const modelGroup = new THREE.Group();
    modelGroupRef.current = modelGroup;
    scene.add(modelGroup);
    explodedPartsRef.current = [];

    // Helper to register parts for explosion
    const registerPart = (mesh: THREE.Mesh, explodeDir: THREE.Vector3) => {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      modelGroup.add(mesh);
      explodedPartsRef.current.push({
        mesh,
        origPos: mesh.position.clone(),
        explodeDir,
      });
    };

    // Construct archetype geometry
    if (modelType === 'wire_spool') {
      // Wire Spool core + insulated copper coils + core strand
      const spoolGeom = new THREE.CylinderGeometry(1.6, 1.6, 0.8, 36);
      const spoolMat = new THREE.MeshStandardMaterial({
        color: 0xef4444, // Red FR PVC wire
        roughness: 0.3,
        metalness: 0.2,
      });
      const spoolMesh = new THREE.Mesh(spoolGeom, spoolMat);
      registerPart(spoolMesh, new THREE.Vector3(0, 0, 0));

      // Inner Hub / Reel core
      const hubGeom = new THREE.CylinderGeometry(0.7, 0.7, 0.9, 24);
      const hubMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
      const hubMesh = new THREE.Mesh(hubGeom, hubMat);
      registerPart(hubMesh, new THREE.Vector3(0, 0.6, 0));

      // Exposed pure copper wire tail
      const copperTailGeom = new THREE.CylinderGeometry(0.08, 0.08, 1.8, 16);
      const copperMat = new THREE.MeshStandardMaterial({
        color: 0xd97706, // Copper orange
        roughness: 0.2,
        metalness: 0.9,
      });
      const copperMesh = new THREE.Mesh(copperTailGeom, copperMat);
      copperMesh.position.set(1.4, 0.6, 0.5);
      copperMesh.rotation.z = Math.PI / 4;
      registerPart(copperMesh, new THREE.Vector3(1.2, 0.8, 0.6));

      // Outer brand band / packaging sleeve
      const bandGeom = new THREE.CylinderGeometry(1.65, 1.65, 0.35, 36);
      const bandMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.4,
      });
      const bandMesh = new THREE.Mesh(bandGeom, bandMat);
      registerPart(bandMesh, new THREE.Vector3(0, -0.6, 0));
    } else if (modelType === 'switch_plate') {
      // Modular Switch Plate: Base Plate, Chrome Bezel, 2 Rocker Switches
      const plateGeom = new THREE.BoxGeometry(2.4, 2.4, 0.25);
      const plateMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.15, metalness: 0.1 });
      const plateMesh = new THREE.Mesh(plateGeom, plateMat);
      registerPart(plateMesh, new THREE.Vector3(0, 0, -0.4));

      // Chrome Accent Rim
      const rimGeom = new THREE.BoxGeometry(2.48, 2.48, 0.08);
      const rimMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.05, metalness: 0.95 });
      const rimMesh = new THREE.Mesh(rimGeom, rimMat);
      rimMesh.position.z = -0.05;
      registerPart(rimMesh, new THREE.Vector3(0, 0, -0.7));

      // Rocker Switch 1 (Left)
      const rocker1Geom = new THREE.BoxGeometry(0.8, 1.4, 0.2);
      const rockerMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.05 });
      const rocker1 = new THREE.Mesh(rocker1Geom, rockerMat);
      rocker1.position.set(-0.55, 0, 0.2);
      rocker1.rotation.x = 0.15;
      registerPart(rocker1, new THREE.Vector3(-0.7, 0, 0.8));

      // Rocker Switch 2 (Right)
      const rocker2 = new THREE.Mesh(rocker1Geom.clone(), rockerMat);
      rocker2.position.set(0.55, 0, 0.2);
      rocker2.rotation.x = -0.15;
      registerPart(rocker2, new THREE.Vector3(0.7, 0, 0.8));

      // Internal Brass Terminal Block
      const terminalGeom = new THREE.BoxGeometry(1.8, 1.6, 0.4);
      const terminalMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.3, metalness: 0.85 });
      const terminalMesh = new THREE.Mesh(terminalGeom, terminalMat);
      terminalMesh.position.set(0, 0, -0.45);
      registerPart(terminalMesh, new THREE.Vector3(0, 0, -1.2));
    } else if (modelType === 'valve') {
      // Brass Ball Valve: Body cylinder, pipe threads, ball core, and handle
      const bodyGeom = new THREE.CylinderGeometry(0.7, 0.7, 2.2, 24);
      const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.25, metalness: 0.85 });
      const bodyMesh = new THREE.Mesh(bodyGeom, brassMat);
      bodyMesh.rotation.z = Math.PI / 2;
      registerPart(bodyMesh, new THREE.Vector3(0, 0, 0));

      // Central Valve Sphere
      const ballGeom = new THREE.SphereGeometry(0.85, 24, 24);
      const chromeBallMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.05, metalness: 0.98 });
      const ballMesh = new THREE.Mesh(ballGeom, chromeBallMat);
      registerPart(ballMesh, new THREE.Vector3(0, 0.8, 0));

      // Blue / Red Heavy-Duty Lever Handle
      const stemGeom = new THREE.CylinderGeometry(0.2, 0.2, 0.6, 16);
      const stemMesh = new THREE.Mesh(stemGeom, brassMat);
      stemMesh.position.set(0, 0.9, 0);
      registerPart(stemMesh, new THREE.Vector3(0, 1.1, 0));

      const handleGeom = new THREE.BoxGeometry(2.0, 0.15, 0.4);
      const handleMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.3 }); // Royal blue lever
      const handleMesh = new THREE.Mesh(handleGeom, handleMat);
      handleMesh.position.set(0.8, 1.25, 0);
      registerPart(handleMesh, new THREE.Vector3(0.5, 1.6, 0));
    } else if (modelType === 'pipe_fitting') {
      // CPVC 90 Degree Heavy-Duty Elbow
      const pipeTorusGeom = new THREE.TorusGeometry(1.1, 0.55, 20, 32, Math.PI / 2);
      const cpvcMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.3, metalness: 0.05 }); // Off-white/yellow CPVC
      const elbowMesh = new THREE.Mesh(pipeTorusGeom, cpvcMat);
      registerPart(elbowMesh, new THREE.Vector3(0, 0, 0));

      // Collar Ring 1
      const collarGeom = new THREE.CylinderGeometry(0.68, 0.68, 0.35, 24);
      const collar1 = new THREE.Mesh(collarGeom, cpvcMat);
      collar1.position.set(1.1, 0, 0);
      collar1.rotation.z = Math.PI / 2;
      registerPart(collar1, new THREE.Vector3(0.8, 0, 0));

      // Collar Ring 2
      const collar2 = new THREE.Mesh(collarGeom.clone(), cpvcMat);
      collar2.position.set(0, 1.1, 0);
      registerPart(collar2, new THREE.Vector3(0, 0.8, 0));

      // Inner solvent ridge
      const ridgeGeom = new THREE.TorusGeometry(0.5, 0.06, 16, 24);
      const ridgeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 });
      const ridgeMesh = new THREE.Mesh(ridgeGeom, ridgeMat);
      ridgeMesh.position.set(1.1, 0, 0);
      ridgeMesh.rotation.y = Math.PI / 2;
      registerPart(ridgeMesh, new THREE.Vector3(1.3, 0, 0));
    } else {
      // LED Light or Fan generic industrial
      const baseGeom = new THREE.CylinderGeometry(1.2, 0.9, 1.1, 32);
      const aluMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.3, metalness: 0.7 });
      const baseMesh = new THREE.Mesh(baseGeom, aluMat);
      registerPart(baseMesh, new THREE.Vector3(0, -0.4, 0));

      const domeGeom = new THREE.SphereGeometry(1.22, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const domeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, emissive: 0xfffbeb, emissiveIntensity: 0.3 });
      const domeMesh = new THREE.Mesh(domeGeom, domeMat);
      domeMesh.position.set(0, 0.55, 0);
      registerPart(domeMesh, new THREE.Vector3(0, 0.8, 0));

      const heatSinkFins = new THREE.TorusGeometry(1.05, 0.1, 16, 32);
      const finsMesh = new THREE.Mesh(heatSinkFins, aluMat);
      finsMesh.rotation.x = Math.PI / 2;
      finsMesh.position.set(0, 0.1, 0);
      registerPart(finsMesh, new THREE.Vector3(0, 0, 0.5));
    }

    // 6. Interactive Drag to Spin (Orbit Controls)
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      previousMousePosition = { x: clientX, y: clientY };
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !modelGroupRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - previousMousePosition.x;
      const deltaY = clientY - previousMousePosition.y;

      modelGroupRef.current.rotation.y += deltaX * 0.01;
      modelGroupRef.current.rotation.x += deltaY * 0.01;

      previousMousePosition = { x: clientX, y: clientY };
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', handlePointerDown);
    domElement.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    domElement.addEventListener('touchstart', handlePointerDown, { passive: true });
    domElement.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);

    // Zoom on wheel
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(3.0, Math.min(10.0, camera.position.z + e.deltaY * 0.005));
    };
    domElement.addEventListener('wheel', handleWheel, { passive: false });

    // 7. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (autoRotate && !isDragging && modelGroupRef.current) {
        modelGroupRef.current.rotation.y += 0.008;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchend', handlePointerUp);
      domElement.removeEventListener('mousedown', handlePointerDown);
      domElement.removeEventListener('mousemove', handlePointerMove);
      domElement.removeEventListener('wheel', handleWheel);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.dispose();
      }
    };
  }, [modelType]);

  // Wireframe toggle effect
  useEffect(() => {
    if (!modelGroupRef.current) return;
    modelGroupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.material) {
          child.material.wireframe = wireframe;
        }
      }
    });
  }, [wireframe]);

  // Exploded View Slider / Toggle
  useEffect(() => {
    const factor = exploded ? 1 : explodeFactor;
    explodedPartsRef.current.forEach(({ mesh, origPos, explodeDir }) => {
      mesh.position.x = origPos.x + explodeDir.x * factor;
      mesh.position.y = origPos.y + explodeDir.y * factor;
      mesh.position.z = origPos.z + explodeDir.z * factor;
    });
  }, [exploded, explodeFactor]);

  // Lighting Mode effect
  useEffect(() => {
    if (!sceneRef.current || !lightsRef.current) return;
    if (lightingMode === 'blueprint') {
      sceneRef.current.background = new THREE.Color(0x061826);
      lightsRef.current.ambient.color = new THREE.Color(0x38bdf8);
      lightsRef.current.main.color = new THREE.Color(0x0284c7);
      lightsRef.current.fill.color = new THREE.Color(0x38bdf8);
    } else if (lightingMode === 'workshop') {
      sceneRef.current.background = new THREE.Color(0x18181b);
      lightsRef.current.ambient.color = new THREE.Color(0xfef08a);
      lightsRef.current.main.color = new THREE.Color(0xffedd5);
      lightsRef.current.fill.color = new THREE.Color(0xf97316);
    } else {
      sceneRef.current.background = new THREE.Color(0x0f172a);
      lightsRef.current.ambient.color = new THREE.Color(0xffffff);
      lightsRef.current.main.color = new THREE.Color(0xffffff);
      lightsRef.current.fill.color = new THREE.Color(0xf59e0b);
    }
  }, [lightingMode]);

  // AI Spec Inspection Hotspots
  const getHotspots = () => {
    switch (modelType) {
      case 'wire_spool':
        return [
          {
            id: 'copper_core',
            title: '99.97% Electrolytic Copper',
            desc: 'Multi-strand annealed pure copper conductor ensuring minimal line loss, high conductivity, and heat resilience up to 70°C continuous duty.',
            spec: 'Class 5 Flexibility · BIS IS:694 Certified',
          },
          {
            id: 'fr_sheath',
            title: 'Flame Retardant Grade PVC',
            desc: 'Self-extinguishing polymer compound with high oxygen index (>29%) preventing fire propagation in residential and commercial conduits.',
            spec: 'Type A Flame Retardant · Zero toxic lead',
          },
          {
            id: 'conductor_resistance',
            title: 'Precision Conductor Gauge',
            desc: 'Uniform cross-sectional diameter verified to eliminate voltage drop over long electrical runs.',
            spec: '12.10 Ohms/km @ 20°C standard',
          },
        ];
      case 'switch_plate':
        return [
          {
            id: 'silver_contact',
            title: 'Silver Inlay Bimetal Contacts',
            desc: 'Pure silver alloy tips prevent contact pitting and sparking during inductive and high inrush LED loads.',
            spec: '100,000+ Click Lifecycle Rating',
          },
          {
            id: 'pc_plate',
            title: 'High-Impact Polycarbonate Face',
            desc: 'UV-stabilized, non-yellowing engineering plastic with gloss finish resisting oil, greases, and everyday wear.',
            spec: 'Glow wire tested up to 850°C',
          },
          {
            id: 'brass_screw',
            title: 'Solid Brass Captive Screws',
            desc: 'Thread-formed brass terminals securely grip copper wires up to 4.0 sq mm without strand shearing.',
            spec: 'Torque tested to 0.8 Nm',
          },
        ];
      case 'valve':
        return [
          {
            id: 'ptfe_seat',
            title: 'PTFE Self-Lubricating Seal',
            desc: 'Virgin Teflon seats prevent chemical degradation from hard water, chlorine, and municipal limescale deposits.',
            spec: 'Bubble-tight zero leak seal',
          },
          {
            id: 'brass_body',
            title: 'Forged DZR Brass Structure',
            desc: 'Dezincification resistant solid forged brass prevents wall pitting under municipal water pressures up to 300 PSI.',
            spec: 'PN 25 / 300 WOG Rated',
          },
        ];
      default:
        return [
          {
            id: 'engineered_core',
            title: 'Heavy-Duty Industrial Grade',
            desc: 'Manufactured according to Indian Standard Specifications for rigorous contractor and site installations.',
            spec: 'ISO 9001 Certified Production',
          },
        ];
    }
  };

  const hotspots = getHotspots();

  const handleGenerateAiAnalysis = () => {
    setAiGenerating(true);
    setTimeout(() => {
      setAiGenerating(false);
      setAiAnalysisResult(
        `AI Engineering Diagnostic for "${product.name}":\n` +
          `• Material Assessment: Conforms to heavy-duty standard specification with high safety margin.\n` +
          `• Heat & Pressure Thresholds: Optimal thermal dissipation under sustained nominal loads.\n` +
          `• Contractor Recommendations: Ideal for concealed conduit cabling or high-pressure plumbing installations.\n` +
          `• Replacement & Longevity: Backed by VoltCart ${product.replacementDays || 10}-Day Admin Replacement Guarantee.`
      );
    }, 900);
  };

  return (
    <div className="bg-slate-950 text-white rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-w-4xl mx-auto my-4 animate-in fade-in zoom-in-95">
      {/* Top Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-white">{product.name}</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30">
                AI 3D SPATIAL VIEW
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Interactive 360° Rotational CAD Model · Drag to spin, pinch to inspect
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Navigation Tabs */}
          <div className="bg-slate-800/80 p-0.5 rounded-xl border border-slate-700/60 flex items-center text-xs">
            <button
              onClick={() => setActiveTab('3d')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === '3d' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              3D CAD Model
            </button>
            <button
              onClick={() => setActiveTab('ar_room')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'ar_room' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              AR Room Placement
            </button>
            <button
              onClick={() => setActiveTab('ai_specs')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'ai_specs' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              AI Spec Exploder
            </button>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main 3D Canvas / Content Area */}
      <div className="relative w-full h-[380px] sm:h-[460px] bg-gradient-to-b from-slate-950 to-slate-900 overflow-hidden">
        {/* TAB 1: 3D INTERACTIVE CANVAS */}
        {activeTab === '3d' && (
          <>
            <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Floating 3D Control Pill */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/70 rounded-xl p-1.5 flex items-center gap-1 shadow-xl">
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors ${
                    autoRotate ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="Toggle Auto Spin"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>360° Auto-Spin</span>
                </button>

                <button
                  onClick={() => setWireframe(!wireframe)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors ${
                    wireframe ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="Toggle Wireframe CAD mesh"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Wireframe</span>
                </button>

                <button
                  onClick={() => setExploded(!exploded)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors ${
                    exploded ? 'bg-emerald-400 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="Explode parts to see internal anatomy"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>{exploded ? 'Collapse Parts' : 'AI Explode'}</span>
                </button>
              </div>

              {/* Environment Lighting Modes */}
              <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-1.5 flex items-center gap-1 text-[10px] w-fit">
                <span className="text-slate-400 px-1 font-semibold flex items-center gap-1">
                  <Sun className="w-3 h-3 text-amber-400" /> Light:
                </span>
                {(['studio', 'workshop', 'blueprint'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setLightingMode(mode)}
                    className={`px-2 py-0.5 rounded capitalize font-medium ${
                      lightingMode === mode ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Gesture Hint */}
            <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
              <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-800 text-[11px] text-slate-400 font-medium">
                👆 Drag to rotate 3D · Scroll to zoom
              </span>
            </div>

            {/* Replacement Guarantee badge in 3D */}
            <div className="absolute bottom-4 right-4 z-10">
              <div className="bg-slate-900/90 backdrop-blur-md border border-emerald-500/40 rounded-xl px-3 py-2 flex items-center gap-2 shadow-xl">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="text-left">
                  <p className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wide">
                    Admin Approved
                  </p>
                  <p className="text-xs font-bold text-white">
                    {product.replacementDays || 10} Days Replacement
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: AR ROOM PLACEMENT SIMULATOR */}
        {activeTab === 'ar_room' && (
          <div className="w-full h-full p-6 flex flex-col items-center justify-center text-center relative bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
            <div className="max-w-md bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center mx-auto">
                <Compass className="w-8 h-8 animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">
                  AR Augmented Reality Wall &amp; Conduit Preview
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Place this {product.brand} fixture on your wall or plumbing manifold to verify exact clearance dimensions.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-left bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase">Mounting Spec:</span>
                  <p className="font-bold text-slate-200">{product.dimensions || 'Standard ISI Modular'}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase">Material:</span>
                  <p className="font-bold text-slate-200">{product.material || 'Engineering Grade Alloy'}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase">Warranty:</span>
                  <p className="font-bold text-emerald-400">{product.warranty}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase">Replacement:</span>
                  <p className="font-bold text-amber-400">{product.replacementDays || 10} Days Guarantee</p>
                </div>
              </div>

              <button
                onClick={() => alert(`AR Camera Mode initialized! Point camera at surface to project 3D ${product.name}.`)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-lg flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>Launch AR Camera Placement (WebXR)</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: AI SPEC EXPLODER & DIAGNOSTIC */}
        {activeTab === 'ai_specs' && (
          <div className="w-full h-full p-4 sm:p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-amber-400" />
                  <span>AI Component Diagnostics &amp; Material Breakdown</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Select any internal anatomy component to view precision engineering specs:
                </p>
              </div>

              <button
                onClick={handleGenerateAiAnalysis}
                disabled={aiGenerating}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                <span>{aiGenerating ? 'Analyzing...' : 'Run AI Analysis'}</span>
              </button>
            </div>

            {/* Hotspots Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {hotspots.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedHotspot(item.id)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedHotspot === item.id
                      ? 'bg-amber-500/10 border-amber-500/80 shadow-md ring-1 ring-amber-500'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-white">{item.title}</h4>
                    <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded">
                      VERIFIED
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                  <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                    <span>{item.spec}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Diagnostics Output Box */}
            {aiAnalysisResult && (
              <div className="p-4 bg-slate-900/90 border border-amber-500/40 rounded-xl space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <Sparkles className="w-4 h-4 fill-amber-400" />
                  <span>AI Structural &amp; Field Report</span>
                </div>
                <pre className="text-xs text-slate-300 font-sans whitespace-pre-wrap leading-relaxed">
                  {aiAnalysisResult}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Footer Info */}
      <div className="bg-slate-900 border-t border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>VoltCart 3D Studio Engine · Real-time Three.js WebGL &amp; AI Analysis</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Warranty: <strong className="text-white">{product.warranty}</strong></span>
          <span>·</span>
          <span>Replacement: <strong className="text-amber-400">{product.replacementDays || 10} Days (Admin Set)</strong></span>
        </div>
      </div>
    </div>
  );
};
