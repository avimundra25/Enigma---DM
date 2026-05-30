import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * TerminalText - A typing animation component that simulates terminal output.
 *
 * Types out each line character-by-character with a blinking cursor,
 * cyan-colored prefix prompt, and green monospace text.
 *
 * @param {string[]} lines - Array of strings to type out sequentially
 * @param {number} speed - Milliseconds per character (default: 30)
 * @param {string} prefix - Terminal prompt string (default: 'root@enigma:~$')
 * @param {function} onComplete - Callback fired when all lines finish typing
 * @param {string} className - Additional CSS classes
 */
function TerminalText({
  lines = [],
  speed = 30,
  prefix = 'root@enigma:~$',
  onComplete,
  className = '',
}) {
  const [completedLines, setCompletedLines] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);
  const onCompleteRef = useRef(onComplete);

  // Keep the ref in sync
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Blinking cursor effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  // Typing effect
  useEffect(() => {
    if (!isTyping || currentLineIndex >= lines.length) return;

    const currentLine = lines[currentLineIndex];

    if (currentCharIndex < currentLine.length) {
      const timeout = setTimeout(() => {
        setCurrentCharIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else {
      // Line finished typing — push to completed lines after a short delay
      const delay = setTimeout(() => {
        setCompletedLines((prev) => [...prev, currentLine]);
        const nextIndex = currentLineIndex + 1;
        if (nextIndex < lines.length) {
          setCurrentLineIndex(nextIndex);
          setCurrentCharIndex(0);
        } else {
          setIsTyping(false);
          if (onCompleteRef.current) {
            onCompleteRef.current();
          }
        }
      }, 300);
      return () => clearTimeout(delay);
    }
  }, [currentCharIndex, currentLineIndex, isTyping, lines, speed]);

  const currentLine = lines[currentLineIndex] || '';
  const typedText = currentLine.slice(0, currentCharIndex);
  const isCurrentLineComplete = currentCharIndex >= currentLine.length;

  return (
    <div className={`font-mono text-sm leading-relaxed ${className}`}>
      {/* Completed lines */}
      {completedLines.map((line, index) => (
        <div key={index} className="flex gap-2 mb-1">
          <span className="text-[#00d4ff] shrink-0">{prefix}</span>
          <span className="text-[#00ff41]">{line}</span>
        </div>
      ))}

      {/* Currently typing line */}
      {isTyping && currentLineIndex < lines.length && (
        <div className="flex gap-2 mb-1">
          <span className="text-[#00d4ff] shrink-0">{prefix}</span>
          <span className="text-[#00ff41]">
            {typedText}
            {!isCurrentLineComplete && (
              <span
                className={`inline-block transition-opacity duration-100 ${
                  showCursor ? 'opacity-100' : 'opacity-0'
                }`}
              >
                █
              </span>
            )}
          </span>
        </div>
      )}

      {/* Blinking cursor on last line after all typing is done */}
      {!isTyping && lines.length > 0 && (
        <div className="flex gap-2 mb-1">
          <span className="text-[#00d4ff] shrink-0">{prefix}</span>
          <span className="text-[#00ff41]">
            <span
              className={`inline-block transition-opacity duration-100 ${
                showCursor ? 'opacity-100' : 'opacity-0'
              }`}
            >
              █
            </span>
          </span>
        </div>
      )}
    </div>
  );
}

export default TerminalText;
