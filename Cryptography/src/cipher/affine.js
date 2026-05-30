/**
 * Affine Cipher — Project ENIGMA
 * 
 * The Affine cipher combines multiplicative and additive operations in Z₂₆:
 *   Encryption: E(x) = (a·x + b) mod 26
 *   Decryption: D(y) = a⁻¹·(y - b) mod 26
 * 
 * Key constraints (Group Theory):
 * - 'a' must be coprime with 26, i.e., gcd(a, 26) = 1
 * - This means a ∈ Z₂₆* = {1,3,5,7,9,11,15,17,19,21,23,25}
 * - The multiplicative group Z₂₆* has order φ(26) = 12
 * - 'b' can be any element of Z₂₆ (0-25)
 * 
 * The Caesar cipher is a special case where a = 1.
 */

import { mod, gcd, modInverse, charToNum, numToChar } from './math.js';

/**
 * Check if a given 'a' value is a valid multiplicative key.
 * It must be coprime with 26 to be invertible in Z₂₆.
 * 
 * @param {number} a - The multiplicative key
 * @returns {boolean}
 */
export const isValidKey = (a) => gcd(mod(a, 26), 26) === 1;

/**
 * Encrypt a single character with the Affine cipher.
 * Returns detailed step-by-step math for the visualization.
 * 
 * @param {string} char - Single uppercase letter
 * @param {number} a - Multiplicative key (must be coprime with 26)
 * @param {number} b - Additive key
 * @returns {object} Encryption steps and result
 */
export const affineEncryptChar = (char, a, b) => {
  if (!/[A-Z]/.test(char)) return { original: char, encrypted: char, isLetter: false };

  const x = charToNum(char);
  const ax = a * x;
  const axPlusB = ax + b;
  const result = mod(axPlusB, 26);

  return {
    original: char,
    x,
    a,
    b,
    ax,
    axPlusB,
    result,
    encrypted: numToChar(result),
    isLetter: true,
    steps: [
      `x = ${x}  (${char} → position)`,
      `a·x = ${a} × ${x} = ${ax}`,
      `a·x + b = ${ax} + ${b} = ${axPlusB}`,
      `(a·x + b) mod 26 = ${axPlusB} mod 26 = ${result}`,
      `Result: ${numToChar(result)}`
    ]
  };
};

/**
 * Decrypt a single character with the Affine cipher.
 * D(y) = a⁻¹ · (y - b) mod 26
 * 
 * @param {string} char - Single uppercase ciphertext letter
 * @param {number} a - Multiplicative key
 * @param {number} b - Additive key
 * @returns {object} Decryption steps and result
 */
export const affineDecryptChar = (char, a, b) => {
  if (!/[A-Z]/.test(char)) return { original: char, decrypted: char, isLetter: false };

  const y = charToNum(char);
  const aInv = modInverse(a, 26);
  if (aInv === null) return { original: char, decrypted: '?', error: true };

  const yMinusB = y - b;
  const product = aInv * yMinusB;
  const result = mod(product, 26);

  return {
    original: char,
    y,
    a,
    b,
    aInv,
    yMinusB,
    product,
    result,
    decrypted: numToChar(result),
    isLetter: true,
    steps: [
      `y = ${y}  (${char} → position)`,
      `a⁻¹ = ${aInv}  (modular inverse of ${a} mod 26)`,
      `y - b = ${y} - ${b} = ${yMinusB}`,
      `a⁻¹ · (y - b) = ${aInv} × ${yMinusB} = ${product}`,
      `Result mod 26 = ${mod(product, 26)}`,
      `Result: ${numToChar(result)}`
    ]
  };
};

/**
 * Encrypt a full message with the Affine cipher.
 * 
 * @param {string} text - Plaintext
 * @param {number} a - Multiplicative key
 * @param {number} b - Additive key
 * @returns {{ text: string, steps: Array, valid: boolean }}
 */
export const affineEncrypt = (text, a, b) => {
  if (!isValidKey(a)) {
    return { text: '', steps: [], valid: false, error: `gcd(${a}, 26) = ${gcd(a, 26)} ≠ 1. Key 'a' must be coprime with 26.` };
  }

  const upper = text.toUpperCase();
  const steps = [];
  let result = '';

  for (const char of upper) {
    const step = affineEncryptChar(char, a, b);
    steps.push(step);
    result += step.encrypted || char;
  }

  return { text: result, steps, valid: true };
};

/**
 * Decrypt a full Affine cipher message.
 * 
 * @param {string} text - Ciphertext
 * @param {number} a - Multiplicative key
 * @param {number} b - Additive key
 * @returns {{ text: string, steps: Array, valid: boolean }}
 */
export const affineDecrypt = (text, a, b) => {
  if (!isValidKey(a)) {
    return { text: '', steps: [], valid: false, error: `gcd(${a}, 26) = ${gcd(a, 26)} ≠ 1. Key 'a' must be coprime with 26.` };
  }

  const upper = text.toUpperCase();
  const steps = [];
  let result = '';

  for (const char of upper) {
    const step = affineDecryptChar(char, a, b);
    steps.push(step);
    result += step.decrypted || char;
  }

  return { text: result, steps, valid: true };
};
