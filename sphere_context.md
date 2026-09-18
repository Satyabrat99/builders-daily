# Knowledge Sphere Context

This file contains the exact, current state of the Knowledge Sphere component (`KnowledgeSphere.js`). 
Use this to reconstruct or reference the exact implementation of the 3D interactive data sphere, including all the fine-tuned hover states, density tweaks, perspective, and glassmorphic card overlays.

## `KnowledgeSphere.js`

```jsx
"use client";
import React, { useRef, useEffect } from 'react';

export default function KnowledgeSphere() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    // Constants
    const NUM_NODES = 212; // Tuned for perfect density
    const SPHERE_RADIUS = Math.min(width, height) * 0.45;
    const MAX_CONNECTION_DIST = SPHERE_RADIUS * 0.25; 
    const PRIMARY_COLOR = '#FF7A18';
    const GLOW_COLOR = 'rgba(255,122,24,0.4)';

    const nodes = [];
    const baseLabels = ["Market Trends", "Competitors", "Sentiment", "Funding", "Research", "LLMs", "DevTools", "APIs", "Community"];

    // Generate points using Fibonacci sphere
    const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle
    for (let i = 0; i < NUM_NODES; i++) {
      const y = 1 - (i / (NUM_NODES - 1)) * 2; // y goes from 1 to -1
      const radius = Math.sqrt(1 - y * y); // radius at y
      const theta = phi * i; // golden angle increment

      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;

      nodes.push({
        x: x * SPHERE_RADIUS,
        y: y * SPHERE_RADIUS,
        z: z * SPHERE_RADIUS,
        baseRadius: Math.random() * 1.5 + 0.5,
        pulseRadius: 0,
        isPulsing: false,
        pulseProgress: 0,
        originalX: x * SPHERE_RADIUS,
        originalY: y * SPHERE_RADIUS,
        originalZ: z * SPHERE_RADIUS,
      });
    }

    // Assign labels to a few random nodes
    const labelIndices = [];
    while(labelIndices.length < baseLabels.length) {
      const r = Math.floor(Math.random() * NUM_NODES);
      if(labelIndices.indexOf(r) === -1) labelIndices.push(r);
    }
    labelIndices.forEach((nodeIndex, i) => {
      nodes[nodeIndex].label = baseLabels[i];
    });

    let mouseX = -1000;
    let mouseY = -1000;
    let rotationAngle = 0;
    let lastTime = performance.now();

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    
    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const pulseInterval = setInterval(() => {
      const randomNode = nodes[Math.floor(Math.random() * NUM_NODES)];
      if (!randomNode.isPulsing) {
        randomNode.isPulsing = true;
        randomNode.pulseProgress = 0;
      }
    }, 2000);

    let animationFrameId;

    const render = (time) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      rotationAngle += delta * 0.12; // Very slow, elegant rotation

      const cx = width / 2;
      const cy = height / 2;

      const cosA = Math.cos(rotationAngle);
      const sinA = Math.sin(rotationAngle);
      const cosB = Math.cos(rotationAngle * 0.4);
      const sinB = Math.sin(rotationAngle * 0.4);

      // Transform Nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        // 3D Rotation
        let rx = node.originalX * cosA - node.originalZ * sinA;
        let rz = node.originalX * sinA + node.originalZ * cosA;
        let ry = node.originalY * cosB - rz * sinB;
        rz = node.originalY * sinB + rz * cosB;

        node.x = rx;
        node.y = ry;
        node.z = rz;

        // Perspective (Stronger depth)
        const fov = 800;
        const zOff = 400;
        const scale = fov / (fov + node.z + zOff);
        
        node.px = cx + node.x * scale * 1.3;
        node.py = cy + node.y * scale * 1.3;
        node.scale = scale;

        // Smooth pulse math
        if (node.isPulsing) {
          node.pulseProgress += delta * 1.5; // Slightly slower radar pulse
          if (node.pulseProgress > Math.PI) {
            node.isPulsing = false;
            node.pulseProgress = 0;
          } 
        }
      }

      // Draw Central Energy Core
      ctx.beginPath();
      // Core radius scales with canvas, about 45% of sphere radius
      const coreRadius = SPHERE_RADIUS * 0.45; 
      ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius);
      coreGrad.addColorStop(0, 'rgba(255, 122, 24, 0.27)'); // Increased by 15%
      coreGrad.addColorStop(0.5, 'rgba(255, 122, 24, 0.19)'); // Increased by 15%
      coreGrad.addColorStop(1, 'rgba(255, 122, 24, 0)'); // Fades completely
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Sort by Z for proper rendering depth (back to front)
      // Positive Z is away, negative Z is close.
      const sortedNodes = [...nodes].sort((a, b) => b.z - a.z);

      // Draw Connections
      for (let i = 0; i < sortedNodes.length; i++) {
        const n1 = sortedNodes[i];
        // 0 (back) to 1 (front)
        const normalizedZ = Math.max(0, Math.min(1, 1 - (n1.z + SPHERE_RADIUS) / (SPHERE_RADIUS * 2)));
        
        // Lowered the hide threshold to keep the mesh intact at the back
        if (normalizedZ < 0.05) continue; 

        const distToMouse = Math.sqrt((n1.px - mouseX) ** 2 + (n1.py - mouseY) ** 2);
        const isHovered = distToMouse < 45; // Reduced hover radius so fewer nodes light up

        for (let j = i + 1; j < sortedNodes.length; j++) {
          const n2 = sortedNodes[j];
          const dist3D = Math.sqrt((n1.x - n2.x)**2 + (n1.y - n2.y)**2 + (n1.z - n2.z)**2);

          if (dist3D < MAX_CONNECTION_DIST) {
             const distRatio = dist3D / MAX_CONNECTION_DIST;
             
             // Base opacity: Maintain a delicate structured mesh everywhere
             const baseAlpha = 0.35;
             // Ensure it never drops below 0.06 so the structure remains visible
             let opacity = Math.max(0.06, (baseAlpha - distRatio * baseAlpha) * Math.pow(normalizedZ, 1.2));
             
             const isN1Pulsing = n1.isPulsing;
             const isN2Pulsing = n2.isPulsing;
             
             // Slate 700 for high contrast (rgb 51, 65, 85)
             let n1Color = `rgba(51, 65, 85, ${opacity})`;
             let n2Color = `rgba(51, 65, 85, ${opacity})`;
             let lineWidth = 0.6; // Ultra-fine default mesh

             if (isHovered && dist3D < MAX_CONNECTION_DIST * 1.2) {
               // Soft localized hover with gradient fade
               const hoverOpacity = Math.max(0, 0.65 - distRatio * 0.45); // Increased intensity
               n1Color = `rgba(255, 122, 24, ${hoverOpacity})`;
               n2Color = `rgba(51, 65, 85, ${opacity})`; // fade out to dark slate
               lineWidth = 1.2;
             } else if (isN1Pulsing || isN2Pulsing) {
               // Crisp energy transfer pulse
               const pulser = isN1Pulsing ? n1 : n2;
               // Map progress to a sharp peak
               const pulseIntensity = Math.sin(pulser.pulseProgress) * 0.6; 
               const finalOpacity = Math.min(opacity + pulseIntensity, 0.7);
               
               if (isN1Pulsing && isN2Pulsing) {
                  n1Color = `rgba(255, 122, 24, ${finalOpacity})`;
                  n2Color = `rgba(255, 122, 24, ${finalOpacity})`;
               } else if (isN1Pulsing) {
                  n1Color = `rgba(255, 122, 24, ${finalOpacity})`;
                  n2Color = `rgba(51, 65, 85, ${opacity})`;
               } else {
                  n1Color = `rgba(51, 65, 85, ${opacity})`;
                  n2Color = `rgba(255, 122, 24, ${finalOpacity})`;
               }
               lineWidth = 1.0;
             }
             
             ctx.beginPath();
             ctx.moveTo(n1.px, n1.py);
             ctx.lineTo(n2.px, n2.py);
             
             // Apply Gradient if colors differ
             if (n1Color !== n2Color) {
                const grad = ctx.createLinearGradient(n1.px, n1.py, n2.px, n2.py);
                grad.addColorStop(0, n1Color);
                grad.addColorStop(1, n2Color);
                ctx.strokeStyle = grad;
             } else {
                ctx.strokeStyle = n1Color;
             }
             
             ctx.lineWidth = lineWidth;
             ctx.stroke();
          }
        }

        // Delicate hover connector
        if (isHovered) {
          ctx.beginPath();
          ctx.moveTo(n1.px, n1.py);
          ctx.lineTo(mouseX, mouseY);
          ctx.strokeStyle = `rgba(255, 122, 24, ${0.25 - (distToMouse/45) * 0.25})`; // Softer connector line
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }

        // Draw Node
        const drawRadius = (n1.baseRadius) * (n1.scale * 2.5); // Base size
        const depthAlpha = Math.max(0.08, normalizedZ); // Minimum 0.08 opacity to keep structure
        
        if (n1.isPulsing) {
          // Crisp expanding radar ring
          ctx.beginPath();
          // pulseProgress goes from 0 to PI. Normalize to 0-1
          const ringProgress = n1.pulseProgress / Math.PI; 
          const ringRadius = drawRadius + (ringProgress * 12); // Ring expands outwards
          ctx.arc(n1.px, n1.py, ringRadius, 0, Math.PI * 2);
          
          // Ring fades out sharply as it expands
          const ringAlpha = Math.max(0, (1 - ringProgress) * 0.5);
          ctx.strokeStyle = `rgba(255, 122, 24, ${ringAlpha})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
          
          // Solid bright core for pulsing node
          ctx.beginPath();
          ctx.arc(n1.px, n1.py, drawRadius * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 122, 24, 0.9)`;
          ctx.fill();
        } else if (isHovered) {
          // Subtle dimensional glow for hovered node
          ctx.beginPath();
          const glowRadius = drawRadius * 2.8; // Increased glow radius
          ctx.arc(n1.px, n1.py, glowRadius, 0, Math.PI * 2);
          
          const nodeGrad = ctx.createRadialGradient(n1.px, n1.py, 0, n1.px, n1.py, glowRadius);
          nodeGrad.addColorStop(0, '#ffffff'); // bright core
          nodeGrad.addColorStop(0.4, `rgba(255, 122, 24, 0.65)`); // Increased intensity and opacity
          nodeGrad.addColorStop(1, `rgba(255, 122, 24, 0)`); // fade out
          
          ctx.fillStyle = nodeGrad;
          ctx.fill();
        } else {
          // Standard base node
          ctx.beginPath();
          ctx.arc(n1.px, n1.py, drawRadius, 0, Math.PI * 2);
          if (n1.label) {
            ctx.fillStyle = '#0f172a'; // Slate 900 for label anchor nodes
          } else {
            ctx.fillStyle = `rgba(51, 65, 85, ${depthAlpha})`; // Slate 700
          }
          ctx.fill();
        }

        // Elegant minimal labels
        if (n1.label && n1.z < 20) { // Only show labels for front and middle nodes
           ctx.font = "600 11px ui-sans-serif, system-ui, sans-serif";
           ctx.fillStyle = `rgba(15, 23, 42, ${Math.min(1, depthAlpha + 0.4)})`; // Slate 900 text
           ctx.fillText(n1.label, n1.px + 10, n1.py + 4);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(pulseInterval);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div style={styles.container}>
      {/* Background Grid */}
      <div style={styles.gridOverlay} />
      
      {/* Canvas */}
      <canvas ref={canvasRef} style={styles.canvas} />

      {/* Glass Report Card */}
      <div style={styles.glassCard}>
        <div style={styles.cardTopRow}>
          <div style={styles.pulseIndicator} />
          <div style={styles.cardHeader}>LIVE DATA</div>
        </div>
        <div style={styles.cardValue}>1.2k updates/sec</div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    height: '500px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'auto',
    margin: '0 auto',
  },
  gridOverlay: {
    position: 'absolute',
    inset: 0,
    opacity: 0.03,
    backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
    backgroundSize: '24px 24px',
    pointerEvents: 'none',
  },
  canvas: {
    width: '100%',
    height: '100%',
    cursor: 'crosshair',
    zIndex: 1,
  },
  glassCard: {
    position: 'absolute',
    bottom: '25%',
    right: '15%',
    padding: '12px 16px', // Smaller padding
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.02) 100%)', // More transparent for refraction
    backdropFilter: 'blur(24px)', // Increased blur for frostier glass effect
    WebkitBackdropFilter: 'blur(24px)',
    borderRadius: '12px', // Slightly smaller radius
    border: '1px solid rgba(255, 255, 255, 0.5)',
    borderTop: '1px solid rgba(255, 255, 255, 0.9)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.7)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)', // Stronger shadow for visibility
    transform: 'perspective(1000px) rotateY(-10deg) rotateX(4deg)', // Gentler perspective
    zIndex: 2,
    pointerEvents: 'none',
    minWidth: 'auto', // Remove forced large width
  },
  cardTopRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
  },
  pulseIndicator: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#FF7A18',
    boxShadow: '0 0 8px #FF7A18',
  },
  cardHeader: {
    color: '#64748b', // Slate 500
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.06em',
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
  },
  cardValue: {
    color: '#0f172a', // Slate 900
    fontSize: '14px', // Smaller font size
    fontWeight: '700',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
  },
  cardSubText: {
    color: '#64748b', // Slate 500
    fontSize: '12px',
    fontWeight: '500',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
  }
};
```
