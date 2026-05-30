import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ScreenTransition = ({ children, screenKey }) => {
  const [isFlashing, setIsFlashing] = useState(false);
  const [currentKey, setCurrentKey] = useState(screenKey);

  useEffect(() => {
    if (screenKey !== currentKey) {
      setIsFlashing(true);
      const timer = setTimeout(() => {
        setCurrentKey(screenKey);
        setIsFlashing(false);
      }, 300); // flash duration before switching content
      return () => clearTimeout(timer);
    }
  }, [screenKey, currentKey]);

  return (
    <div className="relative w-full min-h-screen">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentKey}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.4 }}
          className="w-full min-h-screen"
        >
          {children}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {isFlashing && (
          <motion.div
            key="flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(0,212,255,0.6))',
              mixBlendMode: 'overlay'
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScreenTransition;
