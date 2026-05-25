import React from "react";
import { motion } from "framer-motion";

export const ConfettiRain: React.FC = () => {
  const colors = ["#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#f43f5e", "#eab308", "#06b6d4"];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
      {Array.from({ length: 65 }).map((_, i) => {
        const color = colors[i % colors.length];
        const size = Math.random() * 8 + 6;
        const startX = Math.random() * 100;
        const delay = Math.random() * 0.4;
        const duration = Math.random() * 2.5 + 2;
        const rotate = Math.random() * 360;
        return (
          <motion.div
            key={i}
            className="absolute rounded-sm shadow-sm"
            style={{
              left: `${startX}%`,
              top: `-20px`,
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: color,
            }}
            animate={{
              y: ["0vh", "110vh"],
              x: [`${startX}%`, `${startX + (Math.random() * 30 - 15)}%`],
              rotate: [rotate, rotate + 720],
            }}
            transition={{
              duration: duration,
              delay: delay,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          />
        );
      })}
    </div>
  );
};
