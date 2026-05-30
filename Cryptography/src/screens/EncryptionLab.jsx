/**
 * EncryptionLab — Project ENIGMA (Screen 2)
 *
 * The main cryptography lab screen where users encrypt/decrypt messages.
 * Features a tabbed interface with Caesar Cipher, Affine Cipher, and
 * Brute Force Terminal panels. Includes math visualizations, an SVG
 * alphabet dial, step-by-step affine math, and an animated brute-force
 * terminal. Unlocks mission proceed when the intercepted message is decoded.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScanlineOverlay from '../components/ScanlineOverlay';
import GlitchText from '../components/GlitchText';
import { caesarEncrypt, caesarDecrypt, caesarBruteForce, caesarEncryptChar } from '../cipher/caesar.js';
import { affineEncrypt, affineDecrypt, affineEncryptChar, affineDecryptChar, isValidKey } from '../cipher/affine.js';
import { mod, gcd, modInverse, getCoprimes } from '../cipher/math.js';

/* ──────────────────── Constants ──────────────────── */

const INTERCEPTED_MESSAGE = 'WKLV LV D VHFUHW PHVVDJH';
const DECODED_MESSAGE = 'THIS IS A SECRET MESSAGE';
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const COPRIMES_26 = getCoprimes(26);

const TABS = [
  { id: 'caesar', label: 'CAESAR CIPHER' },
  { id: 'affine', label: 'AFFINE CIPHER' },
  { id: 'bruteforce', label: 'BRUTE FORCE' },
];

/* ──────────────────── Animation Variants ──────────────────── */

const panelVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.2 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.95 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.07, duration: 0.35, ease: 'easeOut' },
  }),
};

const stepVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.12, duration: 0.3 },
  }),
};

/* ════════════════════════════════════════════════════════════
   ALPHABET DIAL — SVG circular visualization for Caesar shift
   ════════════════════════════════════════════════════════════ */

const AlphabetDial = ({ shift, mode }) => {
  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 135;
  const innerR = 90;

  const letterPositions = useMemo(() => {
    return ALPHABET.split('').map((letter, i) => {
      const angle = (i / 26) * 2 * Math.PI - Math.PI / 2;
      return {
        letter,
        ox: cx + outerR * Math.cos(angle),
        oy: cy + outerR * Math.sin(angle),
        ix: cx + innerR * Math.cos(angle),
        iy: cy + innerR * Math.sin(angle),
      };
    });
  }, []);

  return (
    <div className="flex flex-col items-center gap-2">
      <h4 className="text-xs uppercase tracking-[0.2em] text-[#00d4ff]/70 font-[Orbitron]">
        Alphabet Dial — Shift {shift}
      </h4>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        {/* Outer ring background */}
        <circle cx={cx} cy={cy} r={outerR + 18} fill="none" stroke="#00ff4120" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={innerR - 18} fill="none" stroke="#00d4ff20" strokeWidth="1" />

        {/* Connector lines (Tick Marks) */}
        {letterPositions.map((pos, i) => (
          <line
            key={`conn-${i}`}
            x1={pos.ox}
            y1={pos.oy}
            x2={pos.ix}
            y2={pos.iy}
            stroke="#ffffff40"
            strokeWidth="1.5"
          />
        ))}

        {/* Outer ring — original alphabet (fixed) */}
        {letterPositions.map((pos, i) => (
          <text
            key={`outer-${i}`}
            x={pos.ox}
            y={pos.oy}
            textAnchor="middle"
            alignmentBaseline="middle"
            dominantBaseline="central"
            fill="#00ff41"
            fontSize="14"
            fontFamily="'JetBrains Mono', monospace"
            fontWeight="bold"
          >
            {pos.letter}
          </text>
        ))}

        {/* Inner ring — shifted alphabet (animated via CSS transform) */}
        <motion.g
          animate={{ rotate: mode === 'encrypt' ? -(shift / 26) * 360 : (shift / 26) * 360 }}
          transition={{ type: 'spring', stiffness: 60, damping: 15 }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >
          {letterPositions.map((pos, i) => (
            <text
              key={`inner-${i}`}
              x={pos.ix}
              y={pos.iy}
              textAnchor="middle"
              alignmentBaseline="middle"
              dominantBaseline="central"
              fill="#00d4ff"
              fontSize="13"
              fontFamily="'JetBrains Mono', monospace"
              fontWeight="bold"
            >
              {pos.letter}
            </text>
          ))}
        </motion.g>

        {/* Center label */}
        <text x={cx} y={cy - 8} textAnchor="middle" fill="#ffb000" fontSize="16" fontFamily="Orbitron" fontWeight="bold">
          k = {shift}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="#ffffff60" fontSize="10" fontFamily="'JetBrains Mono', monospace">
          (x {mode === 'encrypt' ? '+' : '-'} {shift}) mod 26
        </text>
      </svg>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   CAESAR TAB
   ════════════════════════════════════════════════════════════ */

const CaesarTab = ({ onDecoded }) => {
  const [inputText, setInputText] = useState(INTERCEPTED_MESSAGE);
  const [shift, setShift] = useState(0);
  const [mode, setMode] = useState('decrypt'); // 'encrypt' | 'decrypt'

  const result = useMemo(() => {
    if (!inputText.trim()) return { text: '', steps: [] };
    return mode === 'encrypt'
      ? caesarEncrypt(inputText, shift)
      : caesarDecrypt(inputText, shift);
  }, [inputText, shift, mode]);

  // Check if decoded
  useEffect(() => {
    if (result.text === DECODED_MESSAGE) {
      onDecoded();
    }
  }, [result.text, onDecoded]);

  // Get first 8 letter-steps for visualization
  const letterSteps = useMemo(() => {
    return result.steps.filter((s) => s.isLetter).slice(0, 8);
  }, [result.steps]);

  return (
    <motion.div
      key="caesar"
      variants={panelVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      {/* Header */}
      <h2 className="text-xl md:text-2xl font-[Orbitron] text-[#00ff41] tracking-wider">
        CAESAR CIPHER <span className="text-[#00ff41]/40">//</span>{' '}
        <span className="text-[#00d4ff]">SHIFT ENCRYPTION</span>
      </h2>

      {/* Input + Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column — input & controls */}
        <div className="space-y-4">
          {/* Message input */}
          <div>
            <label className="block text-xs uppercase tracking-[0.15em] text-[#00d4ff]/70 mb-1 font-[Orbitron]">
              Input Message
            </label>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value.toUpperCase())}
              className="w-full bg-[#0d0d14] border border-[#00d4ff]/30 rounded-lg px-4 py-3 text-[#00ff41] font-mono text-sm focus:outline-none focus:border-[#00d4ff] focus:shadow-[0_0_15px_rgba(0,212,255,0.15)] transition-all"
              placeholder="Enter message..."
            />
          </div>

          {/* Shift slider */}
          <div>
            <label className="block text-xs uppercase tracking-[0.15em] text-[#00d4ff]/70 mb-1 font-[Orbitron]">
              Shift Key (k)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="25"
                value={shift}
                onChange={(e) => setShift(parseInt(e.target.value))}
                className="flex-1 accent-[#00ff41] h-2 bg-[#0d0d14] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#00ff41] [&::-webkit-slider-thumb]:shadow-[0_0_10px_#00ff41]"
              />
              <motion.span
                key={shift}
                initial={{ scale: 1.4, color: '#00d4ff' }}
                animate={{ scale: 1, color: '#00ff41' }}
                className="text-2xl font-[Orbitron] font-bold w-10 text-center"
              >
                {shift}
              </motion.span>
            </div>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-2">
            {['encrypt', 'decrypt'].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 px-4 rounded-lg font-[Orbitron] text-xs uppercase tracking-wider border transition-all duration-300 cursor-pointer ${
                  mode === m
                    ? 'bg-[#00ff41]/10 border-[#00ff41] text-[#00ff41] shadow-[0_0_15px_rgba(0,255,65,0.2)]'
                    : 'bg-[#0d0d14] border-[#ffffff10] text-[#ffffff40] hover:border-[#ffffff30]'
                }`}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Output */}
          <div>
            <label className="block text-xs uppercase tracking-[0.15em] text-[#00d4ff]/70 mb-1 font-[Orbitron]">
              Output
            </label>
            <div className="w-full bg-[#0d0d14] border border-[#00ff41]/20 rounded-lg px-4 py-3 text-[#00ff41] font-mono text-sm min-h-[48px] break-all">
              {result.text || '—'}
            </div>
          </div>
        </div>

        {/* Right column — Alphabet Dial */}
        <div className="flex justify-center">
          <AlphabetDial shift={shift} mode={mode} />
        </div>
      </div>

      {/* Math Visualization Cards */}
      {letterSteps.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-[0.15em] text-[#ffb000]/70 mb-3 font-[Orbitron]">
            Step-by-Step Math Visualization
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {letterSteps.map((step, i) => (
              <motion.div
                key={`${step.original}-${i}`}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="bg-[#0a0e0a] border border-[#00ff41]/20 rounded-lg p-3 font-mono text-xs space-y-1"
              >
                <div className="text-center text-[#00d4ff] text-lg font-bold">
                  {step.original} → {step.encrypted}
                </div>
                <div className="text-[#ffffff50]">
                  x = {step.x} <span className="text-[#ffffff30]">({step.original})</span>
                </div>
                <div className="text-[#00ff41]/80">
                  ({step.x} + {step.k}) mod 26
                </div>
                <div className="text-[#ffffff50]">
                  = {step.sum} mod 26 = <span className="text-[#00ff41] font-bold">{step.result}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

/* ════════════════════════════════════════════════════════════
   AFFINE TAB
   ════════════════════════════════════════════════════════════ */

const AffineTab = () => {
  const [inputText, setInputText] = useState('HELLO WORLD');
  const [a, setA] = useState(5);
  const [b, setB] = useState(8);
  const [mode, setMode] = useState('encrypt');
  const [selectedCharIdx, setSelectedCharIdx] = useState(null);
  const [showGroupTheory, setShowGroupTheory] = useState(false);

  const valid = isValidKey(a);
  const gcdVal = gcd(a, 26);

  const result = useMemo(() => {
    if (!inputText.trim()) return { text: '', steps: [], valid: true };
    return mode === 'encrypt'
      ? affineEncrypt(inputText, a, b)
      : affineDecrypt(inputText, a, b);
  }, [inputText, a, b, mode]);

  // Get detailed steps for selected character
  const selectedSteps = useMemo(() => {
    if (selectedCharIdx === null || !result.steps[selectedCharIdx]) return null;
    const step = result.steps[selectedCharIdx];
    if (!step.isLetter) return null;
    return step;
  }, [selectedCharIdx, result.steps]);

  return (
    <motion.div
      key="affine"
      variants={panelVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      {/* Header */}
      <h2 className="text-xl md:text-2xl font-[Orbitron] text-[#00ff41] tracking-wider">
        AFFINE CIPHER <span className="text-[#00ff41]/40">//</span>{' '}
        <span className="text-[#00d4ff]">ALGEBRAIC ENCRYPTION</span>
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column — inputs */}
        <div className="space-y-4">
          {/* Message */}
          <div>
            <label className="block text-xs uppercase tracking-[0.15em] text-[#00d4ff]/70 mb-1 font-[Orbitron]">
              Input Message
            </label>
            <input
              type="text"
              value={inputText}
              onChange={(e) => { setInputText(e.target.value.toUpperCase()); setSelectedCharIdx(null); }}
              className="w-full bg-[#0d0d14] border border-[#00d4ff]/30 rounded-lg px-4 py-3 text-[#00ff41] font-mono text-sm focus:outline-none focus:border-[#00d4ff] focus:shadow-[0_0_15px_rgba(0,212,255,0.15)] transition-all"
              placeholder="Enter message..."
            />
          </div>

          {/* Key a — multiplicative */}
          <div>
            <label className="block text-xs uppercase tracking-[0.15em] text-[#00d4ff]/70 mb-1 font-[Orbitron]">
              Multiplicative Key (a)
            </label>
            <select
              value={a}
              onChange={(e) => setA(parseInt(e.target.value))}
              className="w-full bg-[#0d0d14] border border-[#00d4ff]/30 rounded-lg px-4 py-3 text-[#00ff41] font-mono text-sm focus:outline-none focus:border-[#00d4ff] cursor-pointer appearance-none"
            >
              {Array.from({ length: 26 }, (_, i) => i + 1).map((v) => (
                <option key={v} value={v} className="bg-[#0d0d14]">
                  a = {v} {COPRIMES_26.includes(v) ? '✓ coprime' : '✗ not coprime'}
                </option>
              ))}
            </select>
          </div>

          {/* Key b — additive */}
          <div>
            <label className="block text-xs uppercase tracking-[0.15em] text-[#00d4ff]/70 mb-1 font-[Orbitron]">
              Additive Key (b)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="25"
                value={b}
                onChange={(e) => setB(parseInt(e.target.value))}
                className="flex-1 accent-[#00d4ff] h-2 bg-[#0d0d14] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#00d4ff] [&::-webkit-slider-thumb]:shadow-[0_0_10px_#00d4ff]"
              />
              <span className="text-xl font-[Orbitron] font-bold text-[#00d4ff] w-10 text-center">
                {b}
              </span>
            </div>
          </div>

          {/* Validation display */}
          <motion.div
            className={`rounded-lg border p-3 text-sm font-mono ${
              valid
                ? 'bg-[#00ff41]/5 border-[#00ff41]/30 text-[#00ff41]'
                : 'bg-[#ff0040]/5 border-[#ff0040]/30 text-[#ff0040]'
            }`}
            animate={valid ? {} : { x: [0, -4, 4, -4, 4, 0] }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-2">
              <span>{valid ? '✓' : '✗'}</span>
              <span>
                gcd({a}, 26) = {gcdVal}
                {valid
                  ? ' → Key is valid (invertible in Z₂₆)'
                  : ` ≠ 1 → Key is INVALID. 'a' must be coprime with 26.`}
              </span>
            </div>
            {valid && (
              <div className="text-[#ffffff40] mt-1">
                a⁻¹ mod 26 = {modInverse(a, 26)} | E(x) = ({a}·x + {b}) mod 26
              </div>
            )}
          </motion.div>

          {/* Mode toggle */}
          <div className="flex gap-2">
            {['encrypt', 'decrypt'].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 px-4 rounded-lg font-[Orbitron] text-xs uppercase tracking-wider border transition-all duration-300 cursor-pointer ${
                  mode === m
                    ? 'bg-[#00d4ff]/10 border-[#00d4ff] text-[#00d4ff] shadow-[0_0_15px_rgba(0,212,255,0.2)]'
                    : 'bg-[#0d0d14] border-[#ffffff10] text-[#ffffff40] hover:border-[#ffffff30]'
                }`}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Output */}
          <div>
            <label className="block text-xs uppercase tracking-[0.15em] text-[#00d4ff]/70 mb-1 font-[Orbitron]">
              Output
            </label>
            <div className="w-full bg-[#0d0d14] border border-[#00d4ff]/20 rounded-lg px-4 py-3 text-[#00d4ff] font-mono text-sm min-h-[48px] break-all">
              {result.error ? (
                <span className="text-[#ff0040]">{result.error}</span>
              ) : (
                result.text || '—'
              )}
            </div>
          </div>
        </div>

        {/* Right column — step-by-step & group theory */}
        <div className="space-y-4">
          {/* Click to select letter */}
          {result.steps.length > 0 && valid && (
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-[#ffb000]/70 mb-2 font-[Orbitron]">
                Click a letter to inspect math steps
              </label>
              <div className="flex flex-wrap gap-1">
                {result.steps.map((step, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => step.isLetter && setSelectedCharIdx(i)}
                    className={`w-8 h-8 rounded font-mono text-sm flex items-center justify-center transition-all cursor-pointer border ${
                      selectedCharIdx === i
                        ? 'bg-[#ffb000]/20 border-[#ffb000] text-[#ffb000] shadow-[0_0_10px_rgba(255,176,0,0.3)]'
                        : step.isLetter
                        ? 'bg-[#0d0d14] border-[#ffffff15] text-[#00ff41] hover:border-[#ffb000]/50'
                        : 'bg-transparent border-transparent text-[#ffffff20] cursor-default'
                    }`}
                  >
                    {step.original}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Step-by-step panel for selected letter */}
          <AnimatePresence mode="wait">
            {selectedSteps && (
              <motion.div
                key={`steps-${selectedCharIdx}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-[#0a0e0a] border border-[#ffb000]/30 rounded-lg p-4 overflow-hidden"
              >
                <h4 className="text-xs uppercase tracking-[0.15em] text-[#ffb000] mb-3 font-[Orbitron]">
                  {mode === 'encrypt' ? 'Encryption' : 'Decryption'} Steps — '{selectedSteps.original}'
                </h4>
                <div className="space-y-2">
                  {selectedSteps.steps.map((stepText, i) => (
                    <motion.div
                      key={i}
                      custom={i}
                      variants={stepVariants}
                      initial="hidden"
                      animate="visible"
                      className="font-mono text-sm text-[#00ff41]/90 pl-3 border-l-2 border-[#ffb000]/30"
                    >
                      <span className="text-[#ffb000]/50 mr-2">{i + 1}.</span>
                      {stepText}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Group Theory info box */}
          <div className="border border-[#ffb000]/30 rounded-lg overflow-hidden">
            <button
              onClick={() => setShowGroupTheory(!showGroupTheory)}
              className="w-full flex items-center justify-between px-4 py-3 bg-[#ffb000]/5 hover:bg-[#ffb000]/10 transition-colors cursor-pointer"
            >
              <span className="text-xs uppercase tracking-[0.15em] text-[#ffb000] font-[Orbitron]">
                Group Theory Reference
              </span>
              <motion.span
                animate={{ rotate: showGroupTheory ? 180 : 0 }}
                className="text-[#ffb000]"
              >
                ▼
              </motion.span>
            </button>

            <AnimatePresence>
              {showGroupTheory && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 py-4 space-y-3 text-sm font-mono">
                    <div className="border-l-2 border-[#ffb000]/40 pl-3">
                      <span className="text-[#ffb000] font-bold">Z₂₆</span>{' '}
                      <span className="text-[#ffffff60]">
                        — The cyclic group of integers modulo 26 under addition.
                        Elements: {'{'} 0, 1, 2, …, 25 {'}'}.
                        Each letter maps to an element of this group.
                      </span>
                    </div>
                    <div className="border-l-2 border-[#ffb000]/40 pl-3">
                      <span className="text-[#ffb000] font-bold">Z₂₆*</span>{' '}
                      <span className="text-[#ffffff60]">
                        — The multiplicative group of units mod 26.
                        Elements: {'{'}1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25{'}'}.
                        |Z₂₆*| = φ(26) = 12.
                      </span>
                    </div>
                    <div className="border-l-2 border-[#ff0040]/40 pl-3">
                      <span className="text-[#ff0040] font-bold">Why gcd(a, 26) = 1?</span>{' '}
                      <span className="text-[#ffffff60]">
                        The multiplicative key 'a' must have a modular inverse for decryption.
                        An inverse exists in Z₂₆ if and only if a is coprime with 26.
                        If gcd(a, 26) ≠ 1, distinct letters could map to the same ciphertext,
                        making decryption impossible (the function is not bijective).
                      </span>
                    </div>
                    <div className="border-l-2 border-[#00d4ff]/40 pl-3">
                      <span className="text-[#00d4ff] font-bold">Affine = Multiply + Shift</span>{' '}
                      <span className="text-[#ffffff60]">
                        E(x) = (a·x + b) mod 26 combines a Z₂₆* multiplication and a Z₂₆ addition.
                        Caesar cipher is the special case where a = 1.
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ════════════════════════════════════════════════════════════
   BRUTE FORCE TAB
   ════════════════════════════════════════════════════════════ */

const BruteForceTab = ({ onDecoded }) => {
  const [ciphertext, setCiphertext] = useState(INTERCEPTED_MESSAGE);
  const [running, setRunning] = useState(false);
  const [lines, setLines] = useState([]);
  const [complete, setComplete] = useState(false);
  const [matchShift, setMatchShift] = useState(null);
  const terminalRef = useRef(null);
  const intervalRef = useRef(null);

  const runBruteForce = useCallback(() => {
    // Reset
    setLines([]);
    setComplete(false);
    setMatchShift(null);
    setRunning(true);

    const allResults = caesarBruteForce(ciphertext);
    let idx = 0;

    intervalRef.current = setInterval(() => {
      if (idx >= allResults.length) {
        clearInterval(intervalRef.current);
        setRunning(false);
        setComplete(true);
        return;
      }

      const r = allResults[idx];
      const isMatch = r.text === DECODED_MESSAGE;

      setLines((prev) => [
        ...prev,
        {
          shift: r.shift,
          text: r.text,
          isMatch,
        },
      ]);

      if (isMatch) {
        setMatchShift(r.shift);
        onDecoded();
      }

      idx++;
    }, 50);
  }, [ciphertext, onDecoded]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <motion.div
      key="bruteforce"
      variants={panelVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      {/* Header */}
      <h2 className="text-xl md:text-2xl font-[Orbitron] text-[#00ff41] tracking-wider">
        BRUTE FORCE DECODER <span className="text-[#00ff41]/40">//</span>{' '}
        <span className="text-[#00d4ff]">EXHAUSTIVE SEARCH</span>
      </h2>

      {/* Ciphertext input */}
      <div>
        <label className="block text-xs uppercase tracking-[0.15em] text-[#00d4ff]/70 mb-1 font-[Orbitron]">
          Ciphertext Input
        </label>
        <input
          type="text"
          value={ciphertext}
          onChange={(e) => {
            setCiphertext(e.target.value.toUpperCase());
            setLines([]);
            setComplete(false);
            setMatchShift(null);
          }}
          disabled={running}
          className="w-full bg-[#0d0d14] border border-[#00d4ff]/30 rounded-lg px-4 py-3 text-[#ff0040] font-mono text-sm focus:outline-none focus:border-[#00d4ff] disabled:opacity-50 transition-all"
        />
      </div>

      {/* Run button */}
      <motion.button
        whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(255, 0, 64, 0.3)' }}
        whileTap={{ scale: 0.98 }}
        onClick={runBruteForce}
        disabled={running || !ciphertext.trim()}
        className={`w-full py-3 rounded-lg font-[Orbitron] text-sm uppercase tracking-wider border transition-all cursor-pointer ${
          running
            ? 'bg-[#ff0040]/5 border-[#ff0040]/50 text-[#ff0040]/50 cursor-wait'
            : 'bg-[#ff0040]/10 border-[#ff0040] text-[#ff0040] hover:bg-[#ff0040]/20'
        }`}
      >
        {running ? '⟳ SCANNING ALL SHIFTS...' : '▶ RUN BRUTE FORCE'}
      </motion.button>

      {/* Terminal display */}
      <div
        ref={terminalRef}
        className="bg-black border border-[#00ff41]/20 rounded-lg p-4 h-[400px] overflow-y-auto font-mono text-sm scrollbar-thin scrollbar-thumb-[#00ff41]/20 scrollbar-track-transparent"
      >
        {/* Terminal header */}
        <div className="text-[#ffffff30] mb-2">
          {'>'} Caesar Brute Force Engine v1.0 — Project ENIGMA
        </div>
        <div className="text-[#ffffff30] mb-1">
          {'>'} Target: {ciphertext}
        </div>
        <div className="text-[#ffffff30] mb-3">
          {'>'} Searching key space |Z₂₆| = 26 ...
        </div>

        {lines.length === 0 && !running && (
          <div className="text-[#ffffff20] animate-pulse">
            Awaiting command...
          </div>
        )}

        {/* Brute force lines */}
        {lines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.1 }}
            className={`py-0.5 ${
              line.isMatch
                ? 'text-[#00ff41] font-bold'
                : 'text-[#00ff41]/50'
            }`}
          >
            <span className="text-[#ffffff30]">[SHIFT {String(line.shift).padStart(2, '0')}]</span>{' '}
            <span>{line.text}</span>
            {line.isMatch && (
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="ml-3 text-[#ffb000] inline-block"
              >
                ← MATCH DETECTED
              </motion.span>
            )}
          </motion.div>
        ))}

        {/* Completion banner */}
        <AnimatePresence>
          {complete && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 pt-3 border-t border-[#00ff41]/20"
            >
              <div className="text-[#ffffff30] mb-1">
                {'>'} Search complete. {matchShift !== null ? `Key found: k = ${matchShift}` : 'No known match found.'}
              </div>
              {matchShift !== null && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    textShadow: [
                      '0 0 10px #00ff41',
                      '0 0 20px #00ff41',
                      '0 0 10px #00ff41',
                    ],
                  }}
                  transition={{ duration: 0.8, textShadow: { repeat: Infinity, duration: 2 } }}
                  className="text-[#00ff41] font-bold text-lg mt-2 font-[Orbitron]"
                >
                  ■ DECRYPTION SUCCESSFUL ■
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

/* ════════════════════════════════════════════════════════════
   MAIN ENCRYPTION LAB SCREEN
   ════════════════════════════════════════════════════════════ */

const EncryptionLab = ({ onMissionComplete }) => {
  const [activeTab, setActiveTab] = useState('caesar');
  const [decoded, setDecoded] = useState(false);
  const [showDecodedBanner, setShowDecodedBanner] = useState(false);

  const handleDecoded = useCallback(() => {
    if (!decoded) {
      setDecoded(true);
      setShowDecodedBanner(true);
    }
  }, [decoded]);

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      <ScanlineOverlay />

      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,255,65,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-20 pb-8">
        {/* Screen title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-[Orbitron] font-bold text-[#00ff41] tracking-wider mb-2">
            ENCRYPTION LAB
          </h1>
          <p className="text-[#ffffff40] font-mono text-sm">
            {'>'} cryptographic analysis module loaded {'>'} awaiting operator input
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex gap-2 mb-8 justify-center flex-wrap"
        >
          {TABS.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-lg font-[Orbitron] text-xs uppercase tracking-wider border transition-all duration-300 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#00ff41]/10 border-[#00ff41] text-[#00ff41] shadow-[0_0_20px_rgba(0,255,65,0.15)]'
                  : 'bg-[#0d0d14] border-[#ffffff15] text-[#ffffff50] hover:border-[#00ff41]/40 hover:text-[#00ff41]/70'
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <div className="bg-[#0d0d14]/60 border border-[#ffffff10] rounded-2xl p-6 md:p-8 backdrop-blur-sm">
          <AnimatePresence mode="wait">
            {activeTab === 'caesar' && <CaesarTab key="caesar" onDecoded={handleDecoded} />}
            {activeTab === 'affine' && <AffineTab key="affine" />}
            {activeTab === 'bruteforce' && <BruteForceTab key="bruteforce" onDecoded={handleDecoded} />}
          </AnimatePresence>
        </div>

        {/* Decoded Banner + Proceed Button */}
        <AnimatePresence>
          {showDecodedBanner && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
              className="mt-8 text-center space-y-4"
            >
              {/* Glitch reveal banner */}
              <motion.div
                className="inline-block bg-[#00ff41]/5 border border-[#00ff41]/40 rounded-xl px-8 py-4"
                animate={{
                  boxShadow: [
                    '0 0 15px rgba(0,255,65,0.1)',
                    '0 0 30px rgba(0,255,65,0.2)',
                    '0 0 15px rgba(0,255,65,0.1)',
                  ],
                }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <GlitchText
                  text="■ TRANSMISSION DECODED ■"
                  className="text-2xl md:text-3xl font-[Orbitron] font-bold text-[#00ff41] block"
                  speed={30}
                  as="div"
                />
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="text-[#ffffff50] font-mono text-sm mt-2"
                >
                  Decoded message: "{DECODED_MESSAGE}"
                </motion.p>
              </motion.div>

              {/* Proceed button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
              >
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0,212,255,0.4)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onMissionComplete}
                  className="px-8 py-3 bg-[#00d4ff]/10 border-2 border-[#00d4ff] text-[#00d4ff] rounded-xl font-[Orbitron] text-sm uppercase tracking-wider cursor-pointer hover:bg-[#00d4ff]/20 transition-colors shadow-[0_0_20px_rgba(0,212,255,0.2)]"
                >
                  PROCEED TO MISSION →
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EncryptionLab;
