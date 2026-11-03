import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import {
  Orbit,
  Sliders,
  Filter,
  Eye,
  RotateCcw,
  Play,
  Pause,
  Layers,
  Search,
  Info,
  X,
  Compass,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { api } from '../services/api';
import { AstronomicalPoint, ObjectDetail } from '../types';

export const Universe3DView: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // Controls & Filters State
  const [mode, setMode] = useState<'celestial' | 'spatial'>('celestial');
  const [filterStar, setFilterStar] = useState<boolean>(true);
  const [filterGalaxy, setFilterGalaxy] = useState<boolean>(true);
  const [filterQSO, setFilterQSO] = useState<boolean>(true);
  const [minRedshift, setMinRedshift] = useState<number>(-0.01);
  const [maxRedshift, setMaxRedshift] = useState<number>(7.0);
  const [searchId, setSearchId] = useState<string>('');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [showWireframe, setShowWireframe] = useState<boolean>(true);
  const [showAxes, setShowAxes] = useState<boolean>(true);

  // Data & Selection State
  const [points, setPoints] = useState<AstronomicalPoint[]>([]);
  const [totalFiltered, setTotalFiltered] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedObject, setSelectedObject] = useState<ObjectDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [hoveredPoint, setHoveredPoint] = useState<AstronomicalPoint | null>(null);

  // Three.js instances ref
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const pointsMeshRef = useRef<THREE.Points | null>(null);
  const wireframeSphereRef = useRef<THREE.LineSegments | null>(null);
  const axesHelperRef = useRef<THREE.AxesHelper | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const animFrameIdRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  // Color Mapping
  const COLOR_STAR = useMemo(() => new THREE.Color(0x38bdf8), []);    // Cyan
  const COLOR_GALAXY = useMemo(() => new THREE.Color(0xa855f7), []);  // Violet
  const COLOR_QSO = useMemo(() => new THREE.Color(0xf59e0b), []);     // Gold

  // Fetch points from backend
  const loadData = async () => {
    setLoading(true);
    try {
      const activeClasses: string[] = [];
      if (filterStar) activeClasses.push('STAR');
      if (filterGalaxy) activeClasses.push('GALAXY');
      if (filterQSO) activeClasses.push('QSO');

      const res = await api.getPoints({
        mode,
        classes: activeClasses.length > 0 ? activeClasses : ['NONE'],
        min_redshift: minRedshift,
        max_redshift: maxRedshift,
        limit: 15000
      });
      setPoints(res.points);
      setTotalFiltered(res.total_filtered);
    } catch (err) {
      console.error("Error loading 3D astronomical points:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [mode, filterStar, filterGalaxy, filterQSO, minRedshift, maxRedshift]);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060911);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 3000);
    camera.position.set(0, 40, 220);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // Reference Celestial Wireframe Sphere (R = 100)
    const sphereGeo = new THREE.SphereGeometry(100, 24, 16);
    const wireframeGeo = new THREE.WireframeGeometry(sphereGeo);
    const wireframeMat = new THREE.LineBasicMaterial({ color: 0x1e293b, transparent: true, opacity: 0.4 });
    const wireframeSphere = new THREE.LineSegments(wireframeGeo, wireframeMat);
    scene.add(wireframeSphere);
    wireframeSphereRef.current = wireframeSphere;

    // Celestial Equator and Coordinate Grid
    const axes = new THREE.AxesHelper(130);
    scene.add(axes);
    axesHelperRef.current = axes;

    // Animation Loop
    let angle = 0;
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      if (autoRotate && !isDraggingRef.current && sceneRef.current) {
        sceneRef.current.rotation.y += 0.0015;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Mouse Controls (Orbit / Drag / Zoom)
    const dom = renderer.domElement;

    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = dom.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDraggingRef.current && sceneRef.current) {
        const deltaX = e.clientX - previousMousePositionRef.current.x;
        const deltaY = e.clientY - previousMousePositionRef.current.y;

        sceneRef.current.rotation.y += deltaX * 0.005;
        sceneRef.current.rotation.x += deltaY * 0.005;

        previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      cameraRef.current.position.z += e.deltaY * 0.15;
      cameraRef.current.position.z = Math.max(20, Math.min(cameraRef.current.position.z, 1000));
    };

    const onClick = async () => {
      if (!pointsMeshRef.current || !cameraRef.current) return;

      raycasterRef.current.params.Points.threshold = 3.5;
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObject(pointsMeshRef.current);

      if (intersects.length > 0) {
        const index = intersects[0].index;
        if (index !== undefined && points[index]) {
          const pt = points[index];
          setDetailLoading(true);
          try {
            const detail = await api.getObjectDetail(pt.id);
            setSelectedObject(detail);
          } catch (err) {
            console.error("Error fetching object detail:", err);
          } finally {
            setDetailLoading(false);
          }
        }
      }
    };

    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('click', onClick);

    // Resize handler
    const onResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  // Update Points Geometry when `points` change
  useEffect(() => {
    if (!sceneRef.current) return;

    // Remove existing points mesh
    if (pointsMeshRef.current) {
      sceneRef.current.remove(pointsMeshRef.current);
      pointsMeshRef.current.geometry.dispose();
      (pointsMeshRef.current.material as THREE.Material).dispose();
      pointsMeshRef.current = null;
    }

    if (points.length === 0) return;

    const count = points.length;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const p = points[i];
      positions[i * 3] = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = p.z;

      let c = COLOR_GALAXY;
      if (p.class === 'STAR') c = COLOR_STAR;
      else if (p.class === 'QSO') c = COLOR_QSO;

      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle texture / point material
    const material = new THREE.PointsMaterial({
      size: mode === 'celestial' ? 2.8 : 3.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const pointsMesh = new THREE.Points(geometry, material);
    sceneRef.current.add(pointsMesh);
    pointsMeshRef.current = pointsMesh;
  }, [points, mode, COLOR_STAR, COLOR_GALAXY, COLOR_QSO]);

  // Toggle wireframe & axes
  useEffect(() => {
    if (wireframeSphereRef.current) {
      wireframeSphereRef.current.visible = showWireframe && mode === 'celestial';
    }
    if (axesHelperRef.current) {
      axesHelperRef.current.visible = showAxes;
    }
  }, [showWireframe, showAxes, mode]);

  const resetCamera = () => {
    if (!cameraRef.current || !sceneRef.current) return;
    cameraRef.current.position.set(0, 40, 220);
    cameraRef.current.lookAt(0, 0, 0);
    sceneRef.current.rotation.set(0, 0, 0);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    setDetailLoading(true);
    try {
      const detail = await api.getObjectDetail(searchId.trim());
      setSelectedObject(detail);
    } catch (err) {
      alert(`Objeto con ID '${searchId}' no encontrado en el dataset.`);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-space-950 overflow-hidden flex">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="flex-1 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Mode Selector & Status */}
        <div className="flex items-center gap-2 pointer-events-auto bg-space-900/80 backdrop-blur-md border border-slate-800 p-1.5 rounded-2xl shadow-xl">
          <button
            onClick={() => setMode('celestial')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              mode === 'celestial'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Orbit className="w-3.5 h-3.5" />
            Modo A: Esfera Celeste 3D
          </button>
          <button
            onClick={() => setMode('spatial')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              mode === 'spatial'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Modo B: Espacio 3D Cosmológico
          </button>
        </div>

        {/* View Toggle Actions */}
        <div className="flex items-center gap-2 pointer-events-auto bg-space-900/80 backdrop-blur-md border border-slate-800 p-1.5 rounded-2xl shadow-xl">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-xl text-xs font-mono transition-colors ${
              autoRotate ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/40' : 'text-slate-400 hover:text-white'
            }`}
            title={autoRotate ? "Pausar rotación" : "Activar rotación automática"}
          >
            {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={resetCamera}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            title="Restablecer Cámara"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowWireframe(!showWireframe)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-mono transition-colors ${
              showWireframe ? 'text-cyan-300 bg-cyan-950/60' : 'text-slate-400'
            }`}
            title="Alternar Bóveda Alámbrica"
          >
            Bóveda
          </button>
          <button
            onClick={() => setShowAxes(!showAxes)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-mono transition-colors ${
              showAxes ? 'text-purple-300 bg-purple-950/60' : 'text-slate-400'
            }`}
            title="Alternar Ejes Espaciales"
          >
            Ejes
          </button>
        </div>
      </div>

      {/* Floating Filter Sidebar (Collapsible) */}
      <div className="absolute top-20 left-4 z-20 w-72 bg-space-900/90 backdrop-blur-md border border-slate-800/90 rounded-2xl p-4 shadow-2xl space-y-4 max-h-[calc(100vh-7rem)] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Filtros Dinámicos</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800/40">
            {points.length.toLocaleString()} obj
          </span>
        </div>

        {/* Category Checkboxes with Color Legend */}
        <div className="space-y-2">
          <label className="text-[11px] font-mono text-slate-400 block uppercase">Clasificación Taxonómica</label>
          <div className="space-y-1.5">
            <label className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-space-950 border border-slate-800 cursor-pointer hover:border-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400"></span>
                <span className="text-xs font-medium text-slate-200">STAR (Estrella)</span>
              </div>
              <input
                type="checkbox"
                checked={filterStar}
                onChange={(e) => setFilterStar(e.target.checked)}
                className="rounded accent-cyan-400"
              />
            </label>

            <label className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-space-950 border border-slate-800 cursor-pointer hover:border-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-400 shadow-sm shadow-purple-400"></span>
                <span className="text-xs font-medium text-slate-200">GALAXY (Galaxia)</span>
              </div>
              <input
                type="checkbox"
                checked={filterGalaxy}
                onChange={(e) => setFilterGalaxy(e.target.checked)}
                className="rounded accent-purple-400"
              />
            </label>

            <label className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-space-950 border border-slate-800 cursor-pointer hover:border-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400 shadow-sm shadow-amber-400"></span>
                <span className="text-xs font-medium text-slate-200">QSO (Cuásar)</span>
              </div>
              <input
                type="checkbox"
                checked={filterQSO}
                onChange={(e) => setFilterQSO(e.target.checked)}
                className="rounded accent-amber-400"
              />
            </label>
          </div>
        </div>

        {/* Redshift Range Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[11px] font-mono">
            <span className="text-slate-400 uppercase">Redshift Máximo (z)</span>
            <span className="text-cyan-400 font-bold">{maxRedshift.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="7.0"
            step="0.1"
            value={maxRedshift}
            onChange={(e) => setMaxRedshift(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>Local (0.0)</span>
            <span>Cosmológico (7.0)</span>
          </div>
        </div>

        {/* Search by obj_ID */}
        <form onSubmit={handleSearch} className="space-y-1.5 pt-2 border-t border-slate-800">
          <label className="text-[11px] font-mono text-slate-400 block uppercase">Buscar por obj_ID</label>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="e.g. 1.23766e+18"
              className="flex-1 px-3 py-1.5 rounded-xl bg-space-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-600 font-mono focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Instructions */}
        <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-800/30 text-[11px] text-slate-300 space-y-1">
          <div className="font-semibold text-cyan-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Interacción 3D:
          </div>
          <p>• <strong>Arrastrar:</strong> Rotar boveda celeste.</p>
          <p>• <strong>Rueda del ratón:</strong> Zoom continuo.</p>
          <p>• <strong>Clic sobre partícula:</strong> Inspeccionar objeto con live ML.</p>
        </div>
      </div>

      {/* Selected Object Detail Slide-out Drawer */}
      {selectedObject && (
        <div className="absolute top-4 right-4 z-30 w-96 max-h-[calc(100vh-6rem)] bg-space-900/95 backdrop-blur-xl border border-slate-700 rounded-3xl p-5 shadow-2xl overflow-y-auto space-y-4 animate-in slide-in-from-right duration-300">
          <div className="flex items-start justify-between pb-3 border-b border-slate-800">
            <div>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                selectedObject.class === 'STAR' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                selectedObject.class === 'GALAXY' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                'bg-amber-950 text-amber-300 border border-amber-800'
              }`}>
                {selectedObject.class}
              </span>
              <h3 className="text-sm font-bold text-white font-mono mt-1 truncate">ID: {selectedObject.obj_ID}</h3>
            </div>
            <button
              onClick={() => setSelectedObject(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Machine Learning Prediction Probability Widget */}
          {selectedObject.machine_learning_inference && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border border-indigo-700/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-indigo-300 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Inferencia Supervisada ML
                </span>
                <span className="text-xs font-mono font-bold text-white">
                  {(selectedObject.machine_learning_inference.confidence * 100).toFixed(1)}% Confianza
                </span>
              </div>
              <div className="text-xs text-slate-200">
                Clase Predicha: <strong className="text-cyan-400">{selectedObject.machine_learning_inference.predicted_class}</strong>
                {selectedObject.machine_learning_inference.predicted_class === selectedObject.class ? (
                  <span className="ml-2 text-[10px] text-emerald-400 font-mono">(Coincide ✓)</span>
                ) : (
                  <span className="ml-2 text-[10px] text-rose-400 font-mono">(Discrepancia ✗)</span>
                )}
              </div>
              {/* Probability bars */}
              <div className="space-y-1 pt-1">
                {Object.entries(selectedObject.machine_learning_inference.probabilities).map(([c, prob]) => (
                  <div key={c} className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="w-14 text-slate-400">{c}:</span>
                    <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          c === 'STAR' ? 'bg-cyan-400' : c === 'GALAXY' ? 'bg-purple-400' : 'bg-amber-400'
                        }`}
                        style={{ width: `${(prob as number) * 100}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-slate-300">{((prob as number) * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Coordinates & Physical Distances */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">Coordenadas Celestes</h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-space-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Ascensión Recta (α)</span>
                <span className="text-slate-100 font-bold">{selectedObject.alpha.toFixed(4)}°</span>
              </div>
              <div className="p-2.5 rounded-xl bg-space-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Declinación (δ)</span>
                <span className="text-slate-100 font-bold">{selectedObject.delta.toFixed(4)}°</span>
              </div>
              <div className="p-2.5 rounded-xl bg-space-950 border border-slate-800 col-span-2">
                <span className="text-[10px] text-slate-500 block">Redshift Espectroscópico (z)</span>
                <span className="text-cyan-400 font-bold text-sm">{selectedObject.redshift.toFixed(5)}</span>
                {selectedObject.pos_spatial?.estimated_distance_mpc && (
                  <span className="ml-3 text-[11px] text-slate-400">
                    Dist. Comóvil Est.: ~{selectedObject.pos_spatial.estimated_distance_mpc.toLocaleString()} Mpc
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Photometric Magnitudes (ugriz) */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">Magnitudes Fotométricas (ugriz)</h4>
            <div className="grid grid-cols-5 gap-1.5 text-center font-mono">
              <div className="p-2 rounded-xl bg-space-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">u</span>
                <span className="text-xs font-semibold text-slate-200">{selectedObject.u.toFixed(2)}</span>
              </div>
              <div className="p-2 rounded-xl bg-space-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">g</span>
                <span className="text-xs font-semibold text-slate-200">{selectedObject.g.toFixed(2)}</span>
              </div>
              <div className="p-2 rounded-xl bg-space-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">r</span>
                <span className="text-xs font-semibold text-slate-200">{selectedObject.r.toFixed(2)}</span>
              </div>
              <div className="p-2 rounded-xl bg-space-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">i</span>
                <span className="text-xs font-semibold text-slate-200">{selectedObject.i.toFixed(2)}</span>
              </div>
              <div className="p-2 rounded-xl bg-space-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">z</span>
                <span className="text-xs font-semibold text-slate-200">{selectedObject.z.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Color Indices */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">Índices de Color Astrofísicos</h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded-xl bg-space-950 border border-slate-800 flex justify-between">
                <span className="text-slate-400">u - g:</span>
                <span className="text-slate-200 font-bold">{selectedObject.u_g.toFixed(3)}</span>
              </div>
              <div className="p-2 rounded-xl bg-space-950 border border-slate-800 flex justify-between">
                <span className="text-slate-400">g - r:</span>
                <span className="text-slate-200 font-bold">{selectedObject.g_r.toFixed(3)}</span>
              </div>
              <div className="p-2 rounded-xl bg-space-950 border border-slate-800 flex justify-between">
                <span className="text-slate-400">r - i:</span>
                <span className="text-slate-200 font-bold">{selectedObject.r_i.toFixed(3)}</span>
              </div>
              <div className="p-2 rounded-xl bg-space-950 border border-slate-800 flex justify-between">
                <span className="text-slate-400">i - z:</span>
                <span className="text-slate-200 font-bold">{selectedObject.i_z.toFixed(3)}</span>
              </div>
            </div>
          </div>

          {/* Observation Metadata */}
          <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Placa (Plate):</span>
              <span className="text-slate-200">{selectedObject.plate}</span>
            </div>
            <div className="flex justify-between">
              <span>Fibra (Fiber ID):</span>
              <span className="text-slate-200">{selectedObject.fiber_ID}</span>
            </div>
            <div className="flex justify-between">
              <span>Fecha Juliana (MJD):</span>
              <span className="text-slate-200">{selectedObject.MJD}</span>
            </div>
            <div className="flex justify-between">
              <span>ID Espectroscópico:</span>
              <span className="text-slate-200 truncate max-w-[180px]">{selectedObject.spec_obj_ID}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

