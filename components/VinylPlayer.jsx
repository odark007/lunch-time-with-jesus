"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// Renders a tilted, rotating 3D disc using Three.js.
// `isPlaying` controls whether the disc spins.
// The progress ring itself is drawn separately as SVG (see PlayerRing.jsx)
// layered on top of this canvas, since precise arc math is far simpler in SVG
// than in a WebGL shader, and it keeps this component focused on the disc.
export default function VinylPlayer({ isPlaying, logoUrl = "/disc-label.png" }) {
  const mountRef = useRef(null);
  const discGroupRef = useRef(null);
  const isPlayingRef = useRef(isPlaying);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(0, 2.6, 6.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Static tilt group — the "resting on a turntable" angle.
    const discGroup = new THREE.Group();
    discGroup.rotation.x = -0.55;
    scene.add(discGroup);
    discGroupRef.current = discGroup;

    // Vinyl disc body
    const discGeometry = new THREE.CylinderGeometry(2.4, 2.4, 0.06, 96);
    const discMaterial = new THREE.MeshStandardMaterial({
      color: 0x0b0b0c,
      roughness: 0.4,
      metalness: 0.3
    });
    const disc = new THREE.Mesh(discGeometry, discMaterial);
    discGroup.add(disc);

    // Grooves — thin concentric rings for texture
    for (let r = 0.9; r < 2.35; r += 0.08) {
      const grooveGeo = new THREE.TorusGeometry(r, 0.004, 4, 96);
      const grooveMat = new THREE.MeshStandardMaterial({
        color: 0x232323,
        roughness: 0.6
      });
      const groove = new THREE.Mesh(grooveGeo, grooveMat);
      groove.rotation.x = Math.PI / 2;
      groove.position.y = 0.031;
      discGroup.add(groove);
    }

    // Center label
    const labelGeometry = new THREE.CircleGeometry(0.85, 64);
    const labelMaterial = new THREE.MeshStandardMaterial({
      color: 0xe3a93b,
      roughness: 0.5
    });
    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.rotation.x = -Math.PI / 2;
    label.position.y = 0.035;
    discGroup.add(label);

    // Center spindle hole
    const holeGeometry = new THREE.CircleGeometry(0.06, 32);
    const holeMaterial = new THREE.MeshBasicMaterial({ color: 0x0b0b0c });
    const hole = new THREE.Mesh(holeGeometry, holeMaterial);
    hole.rotation.x = -Math.PI / 2;
    hole.position.y = 0.036;
    discGroup.add(hole);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const keyLight = new THREE.PointLight(0xffffff, 1.4, 20);
    keyLight.position.set(3, 5, 4);
    scene.add(keyLight);

    const glowLight = new THREE.PointLight(0xc8262a, 1.2, 10);
    glowLight.position.set(0, 1, 3);
    scene.add(glowLight);

    let frameId;
    const clock = new THREE.Clock();

    function animate() {
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (isPlayingRef.current) {
        disc.rotation.y += 0.018;
      }

      // Simulated ambient pulse — not tied to real audio, just a gentle breathing glow
      const pulse = 0.9 + Math.sin(elapsed * 1.6) * 0.35;
      glowLight.intensity = isPlayingRef.current ? pulse : 0.5;

      renderer.render(scene, camera);
    }
    animate();

    function handleResize() {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="vinyl-canvas" />;
}
