/**
 * Caesar Cipher — Project ENIGMA
 * 
 * The Caesar cipher is a substitution cipher that shifts each letter
 * by a fixed number of positions in the alphabet.
 * 
 * Mathematically, it's an operation in the cyclic group (Z₂₆, +):
 *   Encryption: E(x) = (x + k) mod 26
 *   Decryption: D(y) = (y - k) mod 26
 * 
 * The shift key k is an element of Z₂₆, and encryption is simply
 * addition by k in this group. The set of all Caesar ciphers forms
 * a cyclic group of order 26 under composition.
 */

import { mod, charToNum, numToChar } from './math.js';

/**
 * Encrypt a single character using Caesar cipher.
 * Returns an object with step-by-step math for visualization.
 * 
 * @param {string} char - Single uppercase letter
 * @param {number} shift - The shift key k ∈ Z₂₆
 * @returns {{ original: string, x: number, k: number, sum: number, result: number, encrypted: string }}
 */
export const caesarEncryptChar = (char, shift) => {
  if (!/[A-Z]/.test(char)) return { original: char, encrypted: char, isLetter: false };
  
  const x = charToNum(char);
  const sum = x + shift;
  const result = mod(sum, 26);
  
  return {
    original: char,
    x,
    k: shift,
    sum,
    result,
    encrypted: numToChar(result),
    isLetter: true,
    // The formula shown to the user
    formula: `E(${x}) = (${x} + ${shift}) mod 26 = ${sum} mod 26 = ${result}`
  };
};

/**
 * Encrypt a full message using Caesar cipher.
 * Preserves non-letter characters (spaces, punctuation).
 * 
 * @param {string} text - Plaintext message
 * @param {number} shift - The shift key k
 * @returns {{ text: string, steps: Array }} Encrypted text and per-character steps
 */
export const caesarEncrypt = (text, shift) => {
  const upper = text.toUpperCase();
  const steps = [];
  let result = '';

  for (const char of upper) {
    const step = caesarEncryptChar(char, mod(shift, 26));
    steps.push(step);
    result += step.encrypted || char;
  }

  return { text: result, steps };
};

/**
 * Decrypt a Caesar cipher message.
 * Decryption is simply encryption with the inverse shift: -k mod 26.
 * In Z₂₆, the inverse of k is (26 - k).
 * 
 * @param {string} text - Ciphertext
 * @param {number} shift - The original shift key k
 * @returns {{ text: string, steps: Array }}
 */
export const caesarDecrypt = (text, shift) => {
  return caesarEncrypt(text, mod(-shift, 26));
};

/**
 * Brute-force all 26 possible Caesar shifts.
 * This demonstrates exhaustive search over the cyclic group Z₂₆ —
 * since |Z₂₆| = 26, we only need 26 attempts.
 * 
 * @param {string} ciphertext - The encrypted message
 * @returns {Array<{ shift: number, text: string }>} All 26 decryptions
 */
export const caesarBruteForce = (ciphertext) => {
  const results = [];
  for (let k = 0; k < 26; k++) {
    const { text } = caesarDecrypt(ciphertext, k);
    results.push({ shift: k, text });
  }
  return results;
};
