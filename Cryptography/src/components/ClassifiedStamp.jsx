import React from 'react';
import { motion } from 'framer-motion';

const ClassifiedStamp = ({ text = 'TOP SECRET', className = '' }) => {
  return (
    <motion.div
      initial={{ scale: 3, opacity: 0, rotate: -20 }}
      animate={{ scale: 1, opacity: 0.8, rotate: -12 }}
      transition={{ type: 'spring', damping: 12, stiffness: 100, delay: 0.5 }}
      className={`absolute z-20 pointer-events-none stamp-pulse ${className}`}
    >
      <div className="border-4 border-enigma-red rounded-md p-2 bg-black/40 backdrop-blur-sm">
        <div className="border-2 border-enigma-red p-3 border-dashed">
          <h2 className="text-enigma-red text-4xl md:text-5xl font-orbitron font-black tracking-[0.2em] uppercase text-glow-red select-none">
            {text}
          </h2>
        </div>
      </div>
    </motion.div>
  );
};

export default ClassifiedStamp;
