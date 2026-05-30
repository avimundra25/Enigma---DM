/**
 * Modular Arithmetic Helpers for Project ENIGMA
 * 
 * These functions implement core discrete mathematics operations
 * used in classical cryptography — operating within the cyclic group Z₂₆.
 */

/**
 * True modulo operation that handles negative numbers correctly.
 * JavaScript's % operator returns remainder (can be negative),
 * but in modular arithmetic we always want a positive result.
 * 
 * @param {number} n - The dividend
 * @param {number} m - The modulus
 * @returns {number} n mod m (always non-negative)
 */
export const mod = (n, m) => ((n % m) + m) % m;

/**
 * Greatest Common Divisor using the Euclidean Algorithm.
 * Used to check if a key value is coprime with 26
 * (required for the Affine cipher's multiplicative key).
 * 
 * In Group Theory: a is a valid multiplicative key for Z₂₆
 * only if gcd(a, 26) = 1, meaning a ∈ Z₂₆* (the group of units).
 * 
 * @param {number} a 
 * @param {number} b 
 * @returns {number} gcd(a, b)
 */
export const gcd = (a, b) => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
};

/**
 * Modular Multiplicative Inverse using the Extended Euclidean Algorithm.
 * Finds x such that (a * x) ≡ 1 (mod m).
 * 
 * This is essential for Affine cipher decryption:
 *   D(y) = a⁻¹ · (y - b) mod 26
 * 
 * The inverse exists only when gcd(a, m) = 1.
 * 
 * @param {number} a - The value to find the inverse of
 * @param {number} m - The modulus
 * @returns {number|null} The modular inverse, or null if it doesn't exist
 */
export const modInverse = (a, m) => {
  a = mod(a, m);
  if (gcd(a, m) !== 1) return null;

  let [old_r, r] = [a, m];
  let [old_s, s] = [1, 0];

  while (r !== 0) {
    const quotient = Math.floor(old_r / r);
    [old_r, r] = [r, old_r - quotient * r];
    [old_s, s] = [s, old_s - quotient * s];
  }

  return mod(old_s, m);
};

/**
 * Get all values coprime with n.
 * For n = 26, these are the valid multiplicative keys for Affine cipher:
 * {1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25}
 * 
 * These form the multiplicative group Z₂₆* of order φ(26) = 12.
 * 
 * @param {number} n - The modulus
 * @returns {number[]} Array of values coprime with n
 */
export const getCoprimes = (n) => {
  const result = [];
  for (let i = 1; i < n; i++) {
    if (gcd(i, n) === 1) {
      result.push(i);
    }
  }
  return result;
};

/**
 * Convert a letter to its numerical position (A=0, B=1, ..., Z=25).
 * Maps characters into Z₂₆ for algebraic operations.
 * 
 * @param {string} char - A single uppercase letter
 * @returns {number} Position in alphabet (0-25)
 */
export const charToNum = (char) => char.charCodeAt(0) - 65;

/**
 * Convert a numerical position back to an uppercase letter.
 * Maps elements of Z₂₆ back to alphabet characters.
 * 
 * @param {number} num - Position in alphabet (0-25)
 * @returns {string} The corresponding uppercase letter
 */
export const numToChar = (num) => String.fromCharCode(mod(num, 26) + 65);
