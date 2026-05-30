import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TerminalText from '../components/TerminalText';
import GlitchText from '../components/GlitchText';
import ClassifiedStamp from '../components/ClassifiedStamp';
import ParticleBackground from '../components/ParticleBackground';
import ScanlineOverlay from '../components/ScanlineOverlay';

/**
 * MissionBriefing — Screen 1 of Project ENIGMA
 *
 * Cinematic intro screen with a 3-phase sequenced animation:
 *   Phase 1 (Boot Sequence): Terminal lines type out one-by-one
 *   Phase 2 (Classified Document): Document card slides up with stamp + briefing
 *   Phase 3 (Title + CTA): Glitch title reveal and INITIATE MISSION button
 *
 * @param {Object} props
 * @param {Function} props.onStartMission - Callback to advance to the next screen
 */

const bootLines = [
  '> ENIGMA SECURE TERMINAL v3.7.1',
  '> Establishing encrypted connection... OK',
  '> CLEARANCE LEVEL: ULTRA',
  '> Authenticating biometrics... VERIFIED',
  '> Loading classified briefing...',
];

function formatDate() {
  const now = new Date();
  const months = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
  ];
  return `${now.getDate().toString().padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

const briefingLines = [
  `▰ OPERATION: PROJECT ENIGMA`,
  `▰ DATE: ${formatDate()}`,
  `▰ STATUS: ACTIVE`,
  `▰ HANDLER: CODENAME ATLAS`,
  ``,
  `⚠ INTERCEPTED TRANSMISSION [FREQ 7.83 MHz]:`,
  `"WKLV LV D VHFUHW PHVVDJH"`,
  ``,
  `INTEL SUGGESTS: CLASSICAL CIPHER ENCRYPTION`,
  `YOUR MISSION: DECODE THE TRANSMISSION`,
  `AND TRACE THE SOURCE THROUGH THE SPY NETWORK`,
];

/** Framer Motion variants for the classified document card */
const documentVariants = {
  hidden: {
    y: 100,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 60,
      damping: 14,
      mass: 1,
    },
  },
  exit: {
    y: -40,
    opacity: 0,
    transition: { duration: 0.4 },
  },
};

/** Framer Motion variants for the title section */
const titleContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.4,
      delayChildren: 0.2,
    },
  },
};

const titleChildVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

/** Pulse glow keyframes for the CTA button */
const pulseGlow = {
  boxShadow: [
    '0 0 5px rgba(0,212,255,0.3), 0 0 15px rgba(0,212,255,0.1)',
    '0 0 10px rgba(0,212,255,0.6), 0 0 30px rgba(0,212,255,0.25)',
    '0 0 5px rgba(0,212,255,0.3), 0 0 15px rgba(0,212,255,0.1)',
  ],
};

function MissionBriefing({ onStartMission }) {
  // Phase state: 'boot' → 'document' → 'title'
  const [phase, setPhase] = useState('boot');

  /** Called when the boot TerminalText finishes typing all lines */
  const handleBootComplete = useCallback(() => {
    // Small pause before transitioning to the document phase
    const timer = setTimeout(() => setPhase('document'), 600);
    return () => clearTimeout(timer);
  }, []);

  /** Called when the briefing TerminalText finishes typing inside the document */
  const handleDocumentComplete = useCallback(() => {
    const timer = setTimeout(() => setPhase('title'), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#0a0a0f' }}
    >
      {/* Particle network behind everything */}
      <ParticleBackground />

      {/* Main content — centered column */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-3xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {/* ─── PHASE 1: Boot Sequence ─── */}
          {phase === 'boot' && (
            <motion.div
              key="boot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.4 } }}
              className="w-full"
            >
              <div
                className="rounded-lg border border-[#00ff41]/20 p-6"
                style={{
                  background: 'rgba(10,10,15,0.9)',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {/* Decorative terminal header bar */}
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#00ff41]/10">
                  <span className="w-3 h-3 rounded-full bg-[#ff0040]" />
                  <span className="w-3 h-3 rounded-full bg-[#ffb000]" />
                  <span className="w-3 h-3 rounded-full bg-[#00ff41]" />
                  <span className="ml-3 text-[#00ff41]/40 text-xs tracking-widest uppercase">
                    enigma-terminal
                  </span>
                </div>

                <TerminalText
                  lines={bootLines}
                  speed={40}
                  prefix=""
                  onComplete={handleBootComplete}
                />
              </div>
            </motion.div>
          )}

          {/* ─── PHASE 2: Classified Document ─── */}
          {phase === 'document' && (
            <motion.div
              key="document"
              variants={documentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full"
            >
              <div
                className="relative rounded-lg border-dashed border-2 border-[#00ff41]/30 p-8"
                style={{
                  background: '#111118',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {/* TOP SECRET stamp overlay */}
                <div className="absolute top-4 right-4 z-20">
                  <ClassifiedStamp text="TOP SECRET" />
                </div>

                {/* Classification header stripe */}
                <div className="mb-6 pb-3 border-b border-[#00ff41]/20">
                  <span className="text-[#ff0040] text-xs tracking-[0.3em] font-bold uppercase">
                    ▰▰ classified // eyes only ▰▰
                  </span>
                </div>

                {/* Briefing content typed out */}
                <div className="text-sm leading-relaxed text-[#00ff41]">
                  <TerminalText
                    lines={briefingLines}
                    speed={30}
                    prefix=""
                    onComplete={handleDocumentComplete}
                  />
                </div>

                {/* Bottom classification stripe */}
                <div className="mt-6 pt-3 border-t border-[#00ff41]/20 flex justify-between items-center">
                  <span className="text-[#ffb000]/60 text-[10px] tracking-widest uppercase">
                    Decrypt &amp; Destroy After Reading
                  </span>
                  <span className="text-[#00ff41]/30 text-[10px] tracking-widest">
                    REF: ENI-7783-ULTRA
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── PHASE 3: Title + Call To Action ─── */}
          {phase === 'title' && (
            <motion.div
              key="title"
              variants={titleContainerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center gap-6"
            >
              {/* Glitching title */}
              <motion.div variants={titleChildVariants}>
                <GlitchText
                  text="PROJECT ENIGMA"
                  className="text-5xl md:text-6xl font-bold tracking-wider"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                  duration={1.5}
                />
              </motion.div>

              {/* Subtitle */}
              <motion.p
                variants={titleChildVariants}
                className="text-[#00d4ff]/70 text-sm md:text-base tracking-[0.35em] uppercase"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                A Classified Cryptography Operation
              </motion.p>

              {/* Decorative divider */}
              <motion.div
                variants={titleChildVariants}
                className="w-48 h-px"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, #00d4ff, transparent)',
                }}
              />

              {/* CTA Button */}
              <motion.button
                variants={titleChildVariants}
                onClick={onStartMission}
                className="relative px-10 py-4 border-2 border-[#00d4ff] text-[#00d4ff] text-sm tracking-[0.3em] uppercase cursor-pointer rounded-sm"
                style={{
                  background: 'transparent',
                  fontFamily: "'Orbitron', sans-serif",
                }}
                animate={pulseGlow}
                transition={{
                  boxShadow: {
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                }}
                whileHover={{
                  backgroundColor: '#00d4ff',
                  color: '#0a0a0f',
                  scale: 1.05,
                  transition: { duration: 0.25 },
                }}
                whileTap={{ scale: 0.97 }}
              >
                Initiate Mission
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CRT scanline overlay on top of everything */}
      <ScanlineOverlay />
    </div>
  );
}

export default MissionBriefing;
