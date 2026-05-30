import { useState, useEffect, useRef, useMemo } from 'react';

/**
 * GlitchText - A text scramble/reveal effect component.
 *
 * On mount, starts with scrambled random characters and gradually resolves
 * to the final text from left to right. After resolving, micro-glitches
 * occasionally scramble 1-2 characters for a continuous cyber effect.
 *
 * @param {string} text - The final text to reveal
 * @param {string} className - Additional CSS classes
 * @param {number} duration - Total scramble-to-resolve duration in ms (default: 2000)
 * @param {string} as - HTML element type to render (default: 'h1')
 */

const GLITCH_CHARS = '!@#$%^&*()_+{}|:<>?01';

function getRandomChar() {
  return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
}

function GlitchText({
  text = '',
  className = '',
  duration = 2000,
  as: Component = 'h1',
}) {
  const [displayText, setDisplayText] = useState('');
  const [resolved, setResolved] = useState(false);
  const frameRef = useRef(null);
  const microGlitchTimerRef = useRef(null);

  // Generate a unique style ID for the chromatic aberration keyframes
  const styleId = useMemo(
    () => `glitch-${Math.random().toString(36).slice(2, 9)}`,
    []
  );

  // Main scramble-to-resolve effect
  useEffect(() => {
    if (!text) return;

    const startTime = performance.now();
    const textLength = text.length;
    const resolveInterval = duration / textLength;

    function animate(now) {
      const elapsed = now - startTime;
      const charsResolved = Math.min(
        Math.floor(elapsed / resolveInterval),
        textLength
      );

      let result = '';
      for (let i = 0; i < textLength; i++) {
        if (i < charsResolved) {
          result += text[i];
        } else {
          result += getRandomChar();
        }
      }

      setDisplayText(result);

      if (charsResolved < textLength) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayText(text);
        setResolved(true);
      }
    }

    // Start with fully scrambled text
    setDisplayText(
      Array.from({ length: text.length }, () => getRandomChar()).join('')
    );
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [text, duration]);

  // Micro-glitch effect after text is resolved
  useEffect(() => {
    if (!resolved || !text) return;

    function doMicroGlitch() {
      const chars = text.split('');
      // Scramble 1-2 random characters
      const glitchCount = Math.random() < 0.5 ? 1 : 2;

      for (let i = 0; i < glitchCount; i++) {
        const idx = Math.floor(Math.random() * chars.length);
        chars[idx] = getRandomChar();
      }

      setDisplayText(chars.join(''));

      // Restore after a brief flash (50-100ms)
      setTimeout(() => {
        setDisplayText(text);
      }, 50 + Math.random() * 50);
    }

    // Schedule micro-glitches every 3-6 seconds
    function scheduleNext() {
      const delay = 3000 + Math.random() * 3000;
      microGlitchTimerRef.current = setTimeout(() => {
        doMicroGlitch();
        scheduleNext();
      }, delay);
    }

    scheduleNext();

    return () => {
      if (microGlitchTimerRef.current) clearTimeout(microGlitchTimerRef.current);
    };
  }, [resolved, text]);

  return (
    <>
      <style>{`
        .glitch-chromatic-${styleId} {
          position: relative;
          text-shadow:
            2px 0 rgba(255, 0, 64, 0.7),
            -2px 0 rgba(0, 212, 255, 0.7);
        }
        .glitch-chromatic-${styleId}::before,
        .glitch-chromatic-${styleId}::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        .glitch-chromatic-${styleId}::before {
          color: rgba(255, 0, 64, 0.4);
          clip-path: inset(0 0 50% 0);
          transform: translate(2px, -1px);
          animation: glitchShift1-${styleId} 4s ease-in-out infinite alternate;
        }
        .glitch-chromatic-${styleId}::after {
          color: rgba(0, 212, 255, 0.4);
          clip-path: inset(50% 0 0 0);
          transform: translate(-2px, 1px);
          animation: glitchShift2-${styleId} 3.5s ease-in-out infinite alternate;
        }
        @keyframes glitchShift1-${styleId} {
          0%, 90% { transform: translate(2px, -1px); }
          93% { transform: translate(-3px, 1px); }
          96% { transform: translate(1px, 0px); }
          100% { transform: translate(2px, -1px); }
        }
        @keyframes glitchShift2-${styleId} {
          0%, 88% { transform: translate(-2px, 1px); }
          91% { transform: translate(3px, -1px); }
          94% { transform: translate(-1px, 0px); }
          100% { transform: translate(-2px, 1px); }
        }
      `}</style>
      <Component
        className={`font-orbitron glitch-chromatic-${styleId} ${className}`}
        data-text={displayText}
      >
        {displayText}
      </Component>
    </>
  );
}

export default GlitchText;
