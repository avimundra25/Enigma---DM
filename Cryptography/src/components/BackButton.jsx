import React from 'react';
import { motion } from 'framer-motion';

const BackButton = ({ onClick }) => {
  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed top-6 left-6 z-50 px-4 py-2 font-[Orbitron] text-xs tracking-[0.2em] uppercase text-[#00ff41] border border-[#00ff41]/30 bg-[#0a0a0f]/80 hover:bg-[#00ff41]/20 hover:border-[#00ff41] transition-colors rounded backdrop-blur-sm shadow-[0_0_10px_rgba(0,255,65,0.1)] hover:shadow-[0_0_15px_rgba(0,255,65,0.3)] cursor-pointer flex items-center gap-2"
    >
      <span>&lt;</span> [ ABORT / RETURN ]
    </motion.button>
  );
};

export default BackButton;
