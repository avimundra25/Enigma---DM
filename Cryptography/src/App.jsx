import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MissionBriefing from './screens/MissionBriefing';
import EncryptionLab from './screens/EncryptionLab';
import SpyMission from './screens/SpyMission';
import BackButton from './components/BackButton';

/**
 * App — Root component and state machine router for Project ENIGMA.
 * 
 * Manages navigation between 3 screens:
 *   1. 'briefing'  → Mission Briefing (cinematic intro)
 *   2. 'lab'       → Encryption Lab (cipher tools)
 *   3. 'mission'   → Final Spy Mission (Dijkstra graph)
 * 
 * Uses AnimatePresence for smooth screen transitions.
 */

const screenVariants = {
  initial: {
    opacity: 0,
    scale: 0.98,
    filter: 'brightness(2) blur(4px)',
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: 'brightness(1) blur(0px)',
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    scale: 1.02,
    filter: 'brightness(3) blur(2px)',
    transition: {
      duration: 0.35,
      ease: 'easeInOut',
    },
  },
};

function App() {
  const [currentScreen, setCurrentScreen] = useState('briefing');
  const [showFlash, setShowFlash] = useState(false);

  const transitionTo = useCallback((screen) => {
    setShowFlash(true);
    setTimeout(() => {
      setCurrentScreen(screen);
      setTimeout(() => setShowFlash(false), 400);
    }, 300);
  }, []);

  const handleStartMission = useCallback(() => transitionTo('lab'), [transitionTo]);
  const handleLabComplete = useCallback(() => transitionTo('mission'), [transitionTo]);
  
  const handleGoBack = useCallback(() => {
    if (currentScreen === 'mission') {
      transitionTo('lab');
    } else if (currentScreen === 'lab') {
      transitionTo('briefing');
    }
  }, [currentScreen, transitionTo]);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'briefing':
        return (
          <motion.div
            key="briefing"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <MissionBriefing onStartMission={handleStartMission} />
          </motion.div>
        );
      case 'lab':
        return (
          <motion.div
            key="lab"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <EncryptionLab onMissionComplete={handleLabComplete} />
          </motion.div>
        );
      case 'mission':
        return (
          <motion.div
            key="mission"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <SpyMission />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen bg-enigma-dark overflow-hidden">
      <AnimatePresence mode="wait">
        {renderScreen()}
      </AnimatePresence>

      <AnimatePresence>
        {currentScreen !== 'briefing' && (
          <BackButton key="back-button" onClick={handleGoBack} />
        )}
      </AnimatePresence>

      {/* Screen transition flash overlay */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            key="flash"
            className="fixed inset-0 z-[100] pointer-events-none"
            style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.4), rgba(0,255,65,0.2))' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
