import React, { useState } from 'react';
import { motion } from 'motion/react';
import officialLogoImg from '../assets/images/official_cgard_logo_1792419387295.jpg';

interface CGaRdLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  isDeveloperMode?: boolean;
}

export const CGaRdLogo: React.FC<CGaRdLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  isDeveloperMode = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const iconDimensions = {
    sm: { box: 36, rounded: 'rounded-xl', text: 'text-lg' },
    md: { box: 48, rounded: 'rounded-2xl', text: 'text-2xl' },
    lg: { box: 64, rounded: 'rounded-2xl', text: 'text-3xl' },
    xl: { box: 88, rounded: 'rounded-3xl', text: 'text-4xl' },
  }[size];

  const letters = [
    { char: 'C', color: 'text-[#FFFFFF]' },
    { char: 'G', color: 'text-[#FFFFFF]' },
    { char: 'a', color: 'text-[#F5F2EB]' },
    { char: 'R', color: 'text-[#FFFFFF]' },
    { char: 'd', color: 'text-[#F5F2EB]' },
  ];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group flex items-center space-x-3 select-none cursor-pointer ${className}`}
      title="CGaRd"
    >
      {/* Official 3D Isometric Stack Logo Icon Container */}
      <div className="relative flex items-center justify-center flex-shrink-0">
        {/* Warm Ambient Gold Radiant Glow */}
        <motion.div
          animate={{
            scale: isHovered ? [1, 1.25, 1.2] : [1, 1.08, 1],
            opacity: isHovered ? 0.9 : [0.4, 0.65, 0.4],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -bottom-1 w-4/5 h-1/2 rounded-full bg-gradient-to-t from-[#A87B4E]/80 via-[#3D2817]/50 to-transparent blur-md pointer-events-none"
        />

        {/* Outer Icon Shell hosting the Official Logo Image */}
        <motion.div
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className={`relative flex items-center justify-center ${iconDimensions.rounded} bg-[#2C3E50] border border-[#A87B4E]/40 shadow-2xl overflow-hidden p-0.5 group-hover:border-[#A87B4E] transition-colors`}
          style={{ width: iconDimensions.box, height: iconDimensions.box }}
        >
          <img
            src={officialLogoImg}
            alt="CGaRd Official Logo"
            className={`w-full h-full object-cover ${iconDimensions.rounded}`}
            loading="eager"
          />

          {/* Video-style subtle sheen glint sweep on hover */}
          <motion.div
            initial={{ x: '-160%', opacity: 0 }}
            animate={isHovered ? { x: '180%', opacity: [0, 0.6, 0] } : {}}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 w-3/5 h-full bg-gradient-to-r from-transparent via-[#FFFFFF]/30 to-transparent transform -skew-x-25 pointer-events-none z-30"
          />
        </motion.div>
      </div>

      {/* Brand Typography */}
      {showText && (
        <span
          className={`font-black tracking-tight font-sans flex items-baseline ${iconDimensions.text}`}
        >
          {letters.map((item, idx) => (
            <span
              key={`${item.char}_${idx}`}
              className={`inline-block transition-transform duration-200 group-hover:scale-105 ${item.color}`}
            >
              {item.char}
            </span>
          ))}
        </span>
      )}
    </div>
  );
};
