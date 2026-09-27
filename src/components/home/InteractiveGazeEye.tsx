import React, { useState, useEffect, useRef } from 'react';
import realisticEyeImg from '../../assets/realistic_eye.png';

export const InteractiveGazeEye: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isBlinking, setIsBlinking] = useState(false);

  // Smooth gaze position state
  const [gaze, setGaze] = useState({
    x: 0,        // px offset for gaze translation
    y: 0,
    tiltX: 0,    // deg 3D perspective rotation X
    tiltY: 0,    // deg 3D perspective rotation Y
    glintX: 0,   // px offset for corneal light reflection
    glintY: 0,
    orbitX: 0,   // px offset for surrounding orbital rings
    orbitY: 0,
    scale: 1,    // subtle scale on proximity
  });

  // Natural spontaneous blinking interval
  useEffect(() => {
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.3) {
        triggerBlink();
      }
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // Real-time smooth cursor tracking
  useEffect(() => {
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;

      const deltaX = e.clientX - eyeCenterX;
      const deltaY = e.clientY - eyeCenterY;
      const distance = Math.hypot(deltaX, deltaY);
      const angle = Math.atan2(deltaY, deltaX);

      // Max movement bounds for natural anatomical eye gaze
      const maxOffset = 24;       // max translation in pixels
      const maxTilt = 18;         // max 3D rotation degrees
      const maxGlintOffset = 18;  // corneal specular reflection travel
      const maxOrbitOffset = 14;  // surrounding orbital rings shift
      const maxDistance = 800;

      const intensity = Math.min(distance / maxDistance, 1);
      const eased = Math.sin((intensity * Math.PI) / 2);

      const targetX = Math.cos(angle) * maxOffset * eased;
      const targetY = Math.sin(angle) * maxOffset * eased;

      // 3D perspective angles: looking up rotates X negative, looking right rotates Y positive
      const tiltX = -(targetY / maxOffset) * maxTilt;
      const tiltY = (targetX / maxOffset) * maxTilt;

      // Specular glint shifts in inverse parallax across the curved spherical cornea
      const glintX = -(targetX / maxOffset) * maxGlintOffset;
      const glintY = -(targetY / maxOffset) * maxGlintOffset;

      // Orbital rings shift gently with depth
      const orbitX = targetX * (maxOrbitOffset / maxOffset);
      const orbitY = targetY * (maxOrbitOffset / maxOffset);

      // Proximity scale: eye subtly engages when cursor is closer
      const proximityScale = 1 + (1 - intensity) * 0.04;

      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        setGaze({
          x: targetX,
          y: targetY,
          tiltX,
          tiltY,
          glintX,
          glintY,
          orbitX,
          orbitY,
          scale: proximityScale,
        });
      });
    };

    const handleMouseLeave = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        setGaze({
          x: 0,
          y: 0,
          tiltX: 0,
          tiltY: 0,
          glintX: 0,
          glintY: 0,
          orbitX: 0,
          orbitY: 0,
          scale: 1,
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleManualBlink = () => {
    setIsBlinking(true);
    setTimeout(() => setIsBlinking(false), 200);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleManualBlink}
      className="relative flex items-center justify-center min-h-[460px] sm:min-h-[520px] select-none cursor-pointer perspective-[1200px]"
      title="Interactive Gaze Tracking: Move your cursor around the screen"
    >
      {/* Outer Concentric Orbital Rings */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-300 ease-out"
        style={{
          transform: `translate(${gaze.orbitX}px, ${gaze.orbitY}px)`,
        }}
      >
        {/* Ring 3 (Outer) */}
        <div className="w-[420px] sm:w-[500px] lg:w-[540px] h-[420px] sm:h-[500px] lg:h-[540px] rounded-full border border-sky-100/90 relative">
          {/* Orbital Node Dots */}
          <div className="absolute top-[28%] -left-1 w-2.5 h-2.5 bg-sky-500 rounded-full ring-4 ring-sky-100 shadow-xs"></div>
          <div className="absolute bottom-[20%] right-10 w-2 h-2 bg-sky-400 rounded-full ring-4 ring-sky-50 shadow-xs"></div>
        </div>

        {/* Ring 2 (Middle Dashed) */}
        <div className="absolute w-[340px] sm:w-[410px] lg:w-[440px] h-[340px] sm:h-[410px] lg:h-[440px] rounded-full border border-dashed border-sky-200/70">
          <div className="absolute top-[12%] right-[18%] w-2 h-2 bg-blue-500 rounded-full ring-4 ring-blue-100"></div>
        </div>

        {/* Ring 1 (Inner Solid) */}
        <div className="absolute w-[280px] sm:w-[330px] lg:w-[360px] h-[280px] sm:h-[330px] lg:h-[360px] rounded-full border border-sky-100/90"></div>
      </div>

      {/* Main 3D Moving Eye Container */}
      <div
        className="relative w-[320px] sm:w-[420px] lg:w-[460px] aspect-square flex items-center justify-center z-10 transition-transform duration-150 ease-out"
        style={{
          transform: `perspective(1000px) rotateX(${gaze.tiltX}deg) rotateY(${gaze.tiltY}deg) translate3d(${gaze.x}px, ${gaze.y}px, 0) scale(${gaze.scale})`,
        }}
      >
        {/* Realistic Eye Image */}
        <div 
          className="relative w-full h-full flex items-center justify-center transition-all duration-150"
          style={{
            transform: isBlinking ? 'scaleY(0.04)' : 'scaleY(1)',
            transformOrigin: 'center center',
            transition: isBlinking ? 'transform 0.08s ease-in' : 'transform 0.12s ease-out',
          }}
        >
          <img
            src={realisticEyeImg}
            alt="Interactive Realistic Human Eye with Eyelashes and Gaze Tracking"
            className="w-full h-full object-contain select-none pointer-events-none drop-shadow-2xl"
          />

          {/* Dynamic Parallax Corneal Specular Glint (Moves across the iris curved surface) */}
          <div
            className="absolute top-[38%] left-[54%] w-10 h-10 rounded-full bg-radial from-white via-white/40 to-transparent blur-[1px] pointer-events-none transition-transform duration-100 ease-out mix-blend-screen"
            style={{
              transform: `translate(${gaze.glintX}px, ${gaze.glintY}px)`,
              opacity: isBlinking ? 0 : 0.85,
            }}
          ></div>

          {/* Secondary micro glint */}
          <div
            className="absolute top-[42%] left-[48%] w-4 h-4 rounded-full bg-white/70 blur-[0.5px] pointer-events-none transition-transform duration-100 ease-out"
            style={{
              transform: `translate(${gaze.glintX * 1.2}px, ${gaze.glintY * 1.2}px)`,
              opacity: isBlinking ? 0 : 0.7,
            }}
          ></div>
        </div>

        {/* Ambient Eye Glow Base */}
        <div className="absolute -inset-4 bg-sky-400/10 rounded-full blur-2xl -z-10 pointer-events-none"></div>
      </div>
    </div>
  );
};
