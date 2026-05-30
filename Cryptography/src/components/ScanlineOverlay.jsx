/**
 * ScanlineOverlay — Project ENIGMA
 * 
 * A subtle CRT scanline effect overlay that sits on top of screen content.
 * Purely decorative - adds that retro-futuristic hacker terminal feel.
 */

import { motion } from 'framer-motion';

const ScanlineOverlay = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Horizontal scanlines */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 65, 0.08) 2px, rgba(0, 255, 65, 0.08) 4px)',
          backgroundSize: '100% 4px',
        }}
      />
      {/* Moving scan beam */}
      <motion.div
        className="absolute left-0 right-0 h-[2px] opacity-[0.07]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(0, 255, 65, 0.4), transparent)',
        }}
        animate={{
          top: ['-2px', '100vh'],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      {/* Vignette effect */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 60%, rgba(0, 0, 0, 0.4) 100%)',
        }}
      />
    </div>
  );
};

export default ScanlineOverlay;
