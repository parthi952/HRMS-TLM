import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface RobotProps {
  isEmailFocused: boolean;
  isPasswordFocused: boolean;
  isError: boolean;
  isSuccess: boolean;
}

export const InteractiveRobot: React.FC<RobotProps> = ({
  isEmailFocused,
  isPasswordFocused,
  isError,
  isSuccess
}) => {
  const robotRef = useRef<HTMLDivElement>(null);
  
  // Real-time organic cursor eye tracking coordinates
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Apply smooth spring physics to avoid mechanical tracking stiffness
  const springX = useSpring(mouseX, { stiffness: 80, damping: 18 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 18 });

  // Parallax transformations for mock-3D rotations
  const headRotateY = useTransform(springX, [-15, 15], [-12, 12]);
  const headRotateX = useTransform(springY, [-12, 12], [10, -10]);
  const eyeTranslateX = useTransform(springX, [-15, 15], [-7, 7]);
  const eyeTranslateY = useTransform(springY, [-12, 12], [-5, 5]);

  // Organic Blinking Cycle State
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    // 4.5-second interval random blink sequence
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 140);
    }, 4500);

    const handleMouseMove = (e: MouseEvent) => {
      if (!robotRef.current) return;
      const rect = robotRef.current.getBoundingClientRect();
      const robotCenterX = rect.left + rect.width / 2;
      const robotCenterY = rect.top + rect.height / 2;
      
      const dx = e.clientX - robotCenterX;
      const dy = e.clientY - robotCenterY;
      const angle = Math.atan2(dy, dx);
      const maxDistance = 350;
      const distance = Math.min(Math.sqrt(dx * dx + dy * dy), maxDistance);
      const intensity = distance / maxDistance;

      // Coordinate offset boundaries
      mouseX.set(Math.cos(angle) * 15 * intensity);
      mouseY.set(Math.sin(angle) * 12 * intensity);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      clearInterval(blinkInterval);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY]);

  return (
    <div ref={robotRef} className="relative w-full max-w-[340px] aspect-square flex items-center justify-center select-none">
      {/* Background Neon Aura Core Reacting to UI States */}
      <motion.div 
        animate={{
          scale: isSuccess ? [1, 1.3, 1.2] : isError ? [1, 1.2, 1.1] : [1, 1.06, 1],
          backgroundColor: isSuccess 
            ? "rgba(16, 185, 129, 0.25)" 
            : isError 
              ? "rgba(239, 68, 68, 0.3)" 
              : isPasswordFocused 
                ? "rgba(139, 92, 246, 0.15)"
                : "rgba(99, 102, 241, 0.15)",
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
        className="absolute w-[220px] h-[220px] rounded-full blur-[55px] z-0 transition-colors duration-500"
      />

      {/* SVG Interactive Robot Character */}
      <motion.svg
        viewBox="0 0 200 240"
        className="w-full h-full z-10 drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
        animate={isError ? {
          x: [-6, 6, -6, 6, -4, 4, 0],
          y: [-2, 2, -2, 2, 0],
          transition: { duration: 0.45, ease: "linear" }
        } : isSuccess ? {
          y: [0, -12, 0, -8, 0],
          transition: { duration: 0.8, ease: "easeInOut", repeat: 1 }
        } : {
          // Subtle natural breathing/sway loop
          y: [0, 4, 0],
          rotate: [-0.6, 0.6, -0.6]
        }}
        transition={!isError && !isSuccess ? {
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut"
        } : undefined}
      >
        <defs>
          {/* High-quality metallic gradients */}
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="50%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="visorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#020617" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>
          <linearGradient id="accentGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <filter id="neonVisorGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Neck Joint */}
        <rect x="92" y="128" width="16" height="15" rx="4" fill="#475569" stroke="#0f172a" strokeWidth="2.5" />

        {/* 2. Robot Chest/Torso */}
        <g id="RobotTorso">
          {/* Main Body Shell */}
          <path 
            d="M 65 140 L 135 140 Q 150 140 145 165 L 138 210 Q 135 220 120 220 L 80 220 Q 65 220 62 210 L 55 165 Q 50 140 65 140" 
            fill="url(#bodyGrad)" 
            stroke="#0f172a" 
            strokeWidth="3"
          />
          {/* Futuristic LED Heart Core */}
          <motion.rect 
            x="86" 
            y="160" 
            width="28" 
            height="28" 
            rx="8" 
            animate={{
              fill: isSuccess 
                ? "#10b981" 
                : isError 
                  ? "#ef4444" 
                  : isPasswordFocused 
                    ? "#8b5cf6" 
                    : ["#6366f1", "#a855f7", "#6366f1"],
              opacity: [0.75, 1, 0.75]
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            stroke="#0f172a" 
            strokeWidth="2" 
          />
          {/* Core Inner details */}
          <line x1="86" y1="174" x2="114" y2="174" stroke="#0f172a" strokeWidth="1.5" />
          <line x1="100" y1="160" x2="100" y2="188" stroke="#0f172a" strokeWidth="1.5" />
        </g>

        {/* 3. Parallax Animated Head (Tracks Cursor coordinates) */}
        <motion.g 
          id="RobotHead"
          style={{ rotateY: headRotateY, rotateX: headRotateX, transformOrigin: "100px 95px" }}
        >
          {/* Left/Right metallic cylindrical ears */}
          <rect x="36" y="78" width="8" height="28" rx="3" fill="#64748b" stroke="#0f172a" strokeWidth="2.5" />
          <rect x="156" y="78" width="8" height="28" rx="3" fill="#64748b" stroke="#0f172a" strokeWidth="2.5" />

          {/* Top Antenna */}
          <line x1="100" y1="56" x2="100" y2="28" stroke="#475569" strokeWidth="3" />
          <motion.circle 
            cx="100" 
            cy="24" 
            r="6" 
            animate={{
              fill: isSuccess ? "#10b981" : isError ? "#ef4444" : "#6366f1",
              scale: [1, 1.3, 1]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            stroke="#0f172a"
            strokeWidth="2"
          />

          {/* Main Skull Dome */}
          <rect x="42" y="52" width="116" height="80" rx="36" fill="url(#bodyGrad)" stroke="#0f172a" strokeWidth="3.5" />
          
          {/* Dynamic LED Visor Plate */}
          <rect 
            x="50" 
            y="64" 
            width="100" 
            height="50" 
            rx="20" 
            fill="url(#visorGrad)" 
            stroke={isError ? "#ef4444" : isSuccess ? "#10b981" : "#475569"} 
            strokeWidth="2.5" 
            className="transition-colors duration-300"
          />

          {/* Glowing Eyes Layer with coordinate parallax + Blinking + Expressions */}
          <motion.g style={{ x: eyeTranslateX, y: eyeTranslateY }}>
            {/* Blinking scale toggle / scaleY collapses to 0.1 */}
            <motion.g animate={{ scaleY: isBlinking ? 0.1 : 1 }} style={{ transformOrigin: "100px 88px" }}>
              {isSuccess ? (
                // Happy Arc Eyes (Success)
                <g fill="none" stroke="#10b981" strokeWidth="4.5" strokeLinecap="round" filter="url(#neonVisorGlow)">
                  <path d="M 68 92 Q 78 80 88 92" />
                  <path d="M 112 92 Q 122 80 132 92" />
                </g>
              ) : isError ? (
                // Shocked Wide Rounded Rect Eyes (Error)
                <g fill="#ef4444" filter="url(#neonVisorGlow)">
                  <circle cx="78" cy="88" r="8" />
                  <circle cx="122" cy="88" r="8" />
                  {/* Flashing Warning Indicator */}
                  <rect x="97" y="78" width="6" height="18" rx="2" fill="#ef4444" />
                  <circle cx="100" cy="100" r="3" fill="#ef4444" />
                </g>
              ) : isPasswordFocused ? (
                // Playful peeking slit eyes behind fingers
                <g fill="#a855f7" filter="url(#neonVisorGlow)">
                  <rect x="68" y="86" width="18" height="4" rx="2" />
                  <rect x="114" y="86" width="18" height="4" rx="2" />
                </g>
              ) : isEmailFocused ? (
                // Wide Curious Ovals (Email field focus)
                <g fill="#22d3ee" filter="url(#neonVisorGlow)">
                  <ellipse cx="78" cy="88" rx="8" ry="11" />
                  <ellipse cx="122" cy="88" rx="8" ry="11" />
                </g>
              ) : (
                // Standard Glowing Circular LED Eyes (Idle)
                <g fill="#6366f1" filter="url(#neonVisorGlow)">
                  <circle cx="78" cy="88" r="6.5" />
                  <circle cx="122" cy="88" r="6.5" />
                </g>
              )}
            </motion.g>
          </motion.g>
        </motion.g>

        {/* 4. Robot Mechanical Arms (Procedural Arm covering & waving) */}
        {/* Left Arm */}
        <motion.g
          id="LeftArm"
          animate={isPasswordFocused ? {
            // covers left eye
            y: [-15, -45],
            x: [0, 20],
            rotate: [0, 48],
            transformOrigin: "35px 165px"
          } : isSuccess ? {
            // victory waving
            y: [0, -10, 0],
            rotate: [0, 75, 0],
            transformOrigin: "35px 165px"
          } : {
            y: 0,
            rotate: 0
          }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
        >
          {/* Shoulder joint */}
          <circle cx="35" cy="165" r="7" fill="#475569" stroke="#0f172a" strokeWidth="2" />
          {/* Arm segment */}
          <path d="M 35 165 Q 20 190 28 215" fill="none" stroke="url(#bodyGrad)" strokeWidth="12" strokeLinecap="round" />
          {/* Knuckles */}
          <circle cx="28" cy="215" r="8" fill="#64748b" stroke="#0f172a" strokeWidth="2" />
        </motion.g>

        {/* Right Arm */}
        <motion.g
          id="RightArm"
          animate={isPasswordFocused ? {
            // covers right eye
            y: [-15, -45],
            x: [0, -20],
            rotate: [0, -48],
            transformOrigin: "165px 165px"
          } : isSuccess ? {
            // victory thumbs up/wave
            y: [0, -10, 0],
            rotate: [0, -75, 0],
            transformOrigin: "165px 165px"
          } : {
            y: 0,
            rotate: 0
          }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
        >
          {/* Shoulder joint */}
          <circle cx="165" cy="165" r="7" fill="#475569" stroke="#0f172a" strokeWidth="2" />
          {/* Arm segment */}
          <path d="M 165 165 Q 180 190 172 215" fill="none" stroke="url(#bodyGrad)" strokeWidth="12" strokeLinecap="round" />
          {/* Knuckles */}
          <circle cx="172" cy="215" r="8" fill="#64748b" stroke="#0f172a" strokeWidth="2" />
        </motion.g>
      </motion.svg>
    </div>
  );
};
