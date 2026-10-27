/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Visualiseur 3D Siège Social & Métaphore Financière Mouhasib
 * Conforme au threejs skill : modèles composites 3-12 pièces, PBR, RoomEnvironment,
 * détection isSoftwareGl, amortissement exponentiel, zéro texture 404.
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

interface ThreeCanvasProps {
  metrics: {
    ca: number;
    charges: number;
    resultatNet: number;
    tresorerie: number;
  };
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ metrics }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Contrôles interactifs du dock
  const [explodedFactor, setExplodedFactor] = useState(0);
  const [isZenMode, setIsZenMode] = useState(false);
  const [cameraPreset, setCameraPreset] = useState<'perspective' | 'front' | 'top' | 'pillars'>('perspective');

  const explodedRef = useRef(0);
  explodedRef.current = explodedFactor;

  const targetCamPosRef = useRef(new THREE.Vector3(12, 10, 16));
  const targetLookAtRef = useRef(new THREE.Vector3(0, 3, 0));

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Détection WebGL logiciel selon le guide
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // Scène et Brouillard horizon
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a101d);
    scene.fog = new THREE.FogExp2(0x0a101d, 0.025);

    // Caméra
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(12, 10, 16);
    const currentLookAt = new THREE.Vector3(0, 3, 0);

    // Moteur de rendu
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Studio Environment (RoomEnvironment + PMREMGenerator)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Éclairage Studio PBR : Clé chaude + Remplissage froid HemisphereLight
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 0.9);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfef08a, 2.2);
    dirLight.position.set(10, 18, 12);
    if (!isSoftwareGl) {
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.camera.near = 0.5;
      dirLight.shadow.camera.far = 40;
      dirLight.shadow.camera.left = -12;
      dirLight.shadow.camera.right = 12;
      dirLight.shadow.camera.top = 12;
      dirLight.shadow.camera.bottom = -12;
      dirLight.shadow.bias = -0.0005;
    }
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    rimLight.position.set(-10, 8, -10);
    scene.add(rimLight);

    // Création de texture procédurale pour le socle (Zellige / Grille géométrique marocaine)
    const canvasTex = document.createElement('canvas');
    canvasTex.width = 512;
    canvasTex.height = 512;
    const ctx = canvasTex.getContext('2d')!;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4;
    for (let i = 0; i <= 512; i += 64) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }
    // Motifs losanges dorés discrets
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    for (let x = 32; x < 512; x += 64) {
      for (let y = 32; y < 512; y += 64) {
        ctx.strokeRect(x - 12, y - 12, 24, 24);
      }
    }
    const floorTexture = new THREE.CanvasTexture(canvasTex);
    floorTexture.colorSpace = THREE.SRGBColorSpace;
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(4, 4);
    floorTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    // Sol PBR
    const floorGeo = new THREE.PlaneGeometry(50, 50);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.65,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = !isSoftwareGl;
    scene.add(floor);

    // Ombre de contact radiale procédurale
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sctx = shadowCanvas.getContext('2d')!;
    const grad = sctx.createRadialGradient(128, 128, 10, 128, 128, 120);
    grad.addColorStop(0, 'rgba(0,0,0,0.7)');
    grad.addColorStop(0.6, 'rgba(0,0,0,0.3)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 256, 256);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 16),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.6 })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.01;
    scene.add(shadowPlane);

    // GROUPE MODÈLE 3D COMPOSITE (3 à 12 pièces distinctes)
    const corporateGroup = new THREE.Group();
    scene.add(corporateGroup);

    // 1. Socle d'ancrage octogonal biseauté
    const plinthGeo = new THREE.CylinderGeometry(6, 6.4, 0.4, 8);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.2,
    });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = 0.2;
    plinth.receiveShadow = true;
    corporateGroup.add(plinth);

    // 2. Anneau en laiton doré biseauté
    const ringGeo = new THREE.TorusGeometry(5.6, 0.12, 16, 48);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.95,
      roughness: 0.15,
    });
    const baseRing = new THREE.Mesh(ringGeo, goldMat);
    baseRing.rotation.x = Math.PI / 2;
    baseRing.position.y = 0.42;
    corporateGroup.add(baseRing);

    // 3. Tour Centrale (Siège Social Mouhasib) - 4 blocs d'étages étagés
    const towerParts: THREE.Mesh[] = [];
    const towerMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      metalness: 0.4,
      roughness: 0.1,
      transmission: isSoftwareGl ? 0 : 0.85,
      transparent: true,
      opacity: isSoftwareGl ? 0.8 : 1,
      ior: 1.5,
      thickness: 1.2,
    });

    const floorSpecs = [
      { w: 3.2, h: 2.2, d: 3.2, y: 1.5 },
      { w: 2.8, h: 2.0, d: 2.8, y: 3.6 },
      { w: 2.4, h: 1.8, d: 2.4, y: 5.5 },
      { w: 1.8, h: 1.4, d: 1.8, y: 7.1 },
    ];

    floorSpecs.forEach((spec) => {
      const bGeo = new THREE.BoxGeometry(spec.w, spec.h, spec.d);
      const mesh = new THREE.Mesh(bGeo, towerMat);
      mesh.position.y = spec.y;
      mesh.castShadow = !isSoftwareGl;
      mesh.receiveShadow = true;
      corporateGroup.add(mesh);
      towerParts.push(mesh);
    });

    // 4. Sommet Flèche / Logo Mouhasib en cristal émeraude
    const spireGeo = new THREE.ConeGeometry(0.8, 1.8, 4);
    const spireMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      metalness: 0.85,
      roughness: 0.2,
      emissive: 0x065f46,
      emissiveIntensity: 0.4,
    });
    const spire = new THREE.Mesh(spireGeo, spireMat);
    spire.position.y = 8.7;
    spire.rotation.y = Math.PI / 4;
    corporateGroup.add(spire);

    // 5. 4 Piliers Financiers Cardinaux
    // Pilier 1 (Nord - Or) : Capitaux Propres
    // Pilier 2 (Sud - Argent) : Actif Immobilisé
    // Pilier 3 (Est - Émeraude) : Chiffre d'Affaires / Ventes
    // Pilier 4 (Ouest - Bronze) : Trésorerie
    const pillarMeshes: { mesh: THREE.Group; basePos: THREE.Vector3; dir: THREE.Vector3 }[] = [];
    const pillarConfigs = [
      { name: 'Capitaux', color: 0xf59e0b, x: 0, z: 4.4, height: 4.5 },
      { name: 'Immobilisations', color: 0x94a3b8, x: 0, z: -4.4, height: 3.8 },
      { name: 'Produits', color: 0x10b981, x: 4.4, z: 0, height: 5.0 },
      { name: 'Trésorerie', color: 0x06b6d4, x: -4.4, z: 0, height: 4.2 },
    ];

    pillarConfigs.forEach((cfg) => {
      const pGroup = new THREE.Group();
      const colGeo = new THREE.CylinderGeometry(0.45, 0.55, cfg.height, 16);
      const colMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        metalness: 0.85,
        roughness: 0.25,
      });
      const colMesh = new THREE.Mesh(colGeo, colMat);
      colMesh.position.y = cfg.height / 2 + 0.4;
      colMesh.castShadow = !isSoftwareGl;
      colMesh.receiveShadow = true;
      pGroup.add(colMesh);

      // Chapiteau / Balise supérieure lumineuse
      const capGeo = new THREE.BoxGeometry(1.1, 0.3, 1.1);
      const capMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.9,
        roughness: 0.1,
        emissive: cfg.color,
        emissiveIntensity: 0.6,
      });
      const capMesh = new THREE.Mesh(capGeo, capMat);
      capMesh.position.y = cfg.height + 0.55;
      pGroup.add(capMesh);

      corporateGroup.add(pGroup);
      const bPos = new THREE.Vector3(cfg.x, 0, cfg.z);
      const nDir = bPos.clone().normalize();
      pillarMeshes.push({ mesh: pGroup, basePos: bPos, dir: nDir });
    });

    // 6. Anneau Holographique Orbital Rotatif
    const orbitTorusGeo = new THREE.TorusGeometry(6.8, 0.05, 8, 64);
    const orbitMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.3,
      metalness: 0.7,
    });
    const orbitRing = new THREE.Mesh(orbitTorusGeo, orbitMat);
    orbitRing.rotation.x = Math.PI / 3;
    orbitRing.position.y = 4.5;
    scene.add(orbitRing);

    // Variables pour l'interaction souris (rotation douce manuelle)
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let sphericalTheta = Math.PI / 4;
    let sphericalPhi = Math.PI / 3;
    let sphericalRadius = 22;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      sphericalTheta -= dx * 0.006;
      sphericalPhi = Math.max(0.15, Math.min(Math.PI / 2 - 0.05, sphericalPhi - dy * 0.006));
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Gestion du redimensionnement
    const handleResize = () => {
      if (!container) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    // Boucle d'animation à 60 fps avec amortissement
    let animId = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Rotation douce continue du groupe et de l'orbite
      orbitRing.rotation.z += 0.4 * dt;
      spire.rotation.y += 0.8 * dt;

      // Animation vue éclatée (Exploded View)
      const currentExploded = explodedRef.current;
      pillarMeshes.forEach((item) => {
        const offset = item.dir.clone().multiplyScalar(currentExploded * 3.5);
        item.mesh.position.x = item.basePos.x + offset.x;
        item.mesh.position.z = item.basePos.z + offset.z;
        item.mesh.position.y = offset.y * 0.5;
      });

      towerParts.forEach((part, idx) => {
        const yOffset = currentExploded * (idx + 1) * 0.8;
        part.position.y = floorSpecs[idx].y + yOffset;
      });
      spire.position.y = 8.7 + currentExploded * 4.2;

      // Calcul des coordonnées sphériques vers cartésiennes pour la caméra
      if (cameraPreset === 'perspective') {
        const targetX = targetLookAtRef.current.x + sphericalRadius * Math.sin(sphericalPhi) * Math.sin(sphericalTheta);
        const targetY = targetLookAtRef.current.y + sphericalRadius * Math.cos(sphericalPhi);
        const targetZ = targetLookAtRef.current.z + sphericalRadius * Math.sin(sphericalPhi) * Math.cos(sphericalTheta);
        targetCamPosRef.current.set(targetX, targetY, targetZ);
      }

      // Amortissement exponentiel doux pour la position de caméra
      camera.position.lerp(targetCamPosRef.current, 1 - Math.exp(-6 * dt));
      currentLookAt.lerp(targetLookAtRef.current, 1 - Math.exp(-6 * dt));
      camera.lookAt(currentLookAt);

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        animId = window.setTimeout(() => requestAnimationFrame(tick), 60);
      } else {
        animId = requestAnimationFrame(tick);
      }
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(animId);
      domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (domElement.parentNode) {
        domElement.parentNode.removeChild(domElement);
      }
    };
  }, [cameraPreset]);

  // Gestion des préréglages de caméra
  const handlePreset = (preset: 'perspective' | 'front' | 'top' | 'pillars') => {
    setCameraPreset(preset);
    if (preset === 'perspective') {
      targetCamPosRef.current.set(14, 11, 16);
      targetLookAtRef.current.set(0, 3, 0);
    } else if (preset === 'front') {
      targetCamPosRef.current.set(0, 4, 18);
      targetLookAtRef.current.set(0, 4, 0);
    } else if (preset === 'top') {
      targetCamPosRef.current.set(0.1, 22, 0.1);
      targetLookAtRef.current.set(0, 0, 0);
    } else if (preset === 'pillars') {
      targetCamPosRef.current.set(8, 5, 8);
      targetLookAtRef.current.set(2, 2, 2);
    }
  };

  return (
    <div className="relative w-full h-[520px] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
      {/* Container WebGL isolé */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Badge statut minimal en haut à gauche */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3 bg-slate-900/90 border border-slate-700/60 px-3.5 py-1.5 rounded-lg pointer-events-none">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
          Métaphore 3D : Siège Social & Solidité Financière
        </span>
      </div>

      {/* Badge indicateur de drag */}
      <div className="absolute top-4 right-4 z-10 hidden sm:flex items-center gap-2 bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 px-2.5 py-1 rounded">
        <span>Glisser pour orbiter • Vue interactive</span>
      </div>

      {/* DOCK INFÉRIEUR COLLAPSIBLE (<= 15% du viewport, sans backdrop-filter pour WebGL) */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-3xl transition-transform duration-300 ease-in-out ${
          isZenMode ? 'translate-y-[calc(100%-28px)]' : 'translate-y-0'
        }`}
      >
        {/* Poignée de rétractation (Zen / Mode Cinéma) */}
        <div className="flex justify-center -mb-px">
          <button
            onClick={() => setIsZenMode(!isZenMode)}
            className="bg-slate-900 hover:bg-slate-800 border-t border-x border-slate-700 text-slate-300 hover:text-white text-[11px] font-medium px-4 py-1 rounded-t-lg transition flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <span>{isZenMode ? '▲ Afficher les contrôles 3D' : '▼ Mode Plein Écran (Masquer le Dock)'}</span>
          </button>
        </div>

        {/* Corps solide du Dock */}
        <div className="bg-slate-900 border border-slate-700 rounded-b-xl p-3 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Curseur Vue Éclatée (Exploded View) */}
            <div className="flex items-center gap-2.5 flex-1 min-w-[200px]">
              <span className="text-xs font-medium text-slate-300 whitespace-nowrap">Vue éclatée :</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={explodedFactor}
                onChange={(e) => setExplodedFactor(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <span className="text-xs font-mono text-emerald-400 w-9 text-right">
                {Math.round(explodedFactor * 100)}%
              </span>
            </div>

            {/* Sélecteur d'Angles de Caméra */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-lg border border-slate-700/70">
              <button
                onClick={() => handlePreset('perspective')}
                className={`px-2.5 py-1 text-xs rounded font-medium transition cursor-pointer ${
                  cameraPreset === 'perspective' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                Générale
              </button>
              <button
                onClick={() => handlePreset('front')}
                className={`px-2.5 py-1 text-xs rounded font-medium transition cursor-pointer ${
                  cameraPreset === 'front' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                Façade
              </button>
              <button
                onClick={() => handlePreset('pillars')}
                className={`px-2.5 py-1 text-xs rounded font-medium transition cursor-pointer ${
                  cameraPreset === 'pillars' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                Piliers
              </button>
              <button
                onClick={() => handlePreset('top')}
                className={`px-2.5 py-1 text-xs rounded font-medium transition cursor-pointer ${
                  cameraPreset === 'top' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                Zénith
              </button>
            </div>

            {/* Métriques Flash intégrées */}
            <div className="flex items-center gap-3 border-l border-slate-700 pl-3">
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase">Trésorerie</div>
                <div className="text-xs font-bold font-mono text-cyan-400">
                  {metrics.tresorerie.toLocaleString('fr-FR')} MAD
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase">Résultat</div>
                <div className="text-xs font-bold font-mono text-emerald-400">
                  {metrics.resultatNet.toLocaleString('fr-FR')} MAD
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
