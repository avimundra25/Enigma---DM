# 🕶️ PROJECT ENIGMA

> **STATUS:** CLASSIFIED // ACTIVE  
> **OPERATION:** SECURE CRYPTOGRAPHY & PATHFINDING  

Welcome to **Project ENIGMA**, a highly interactive, cinematic web application built to visualize classical cryptography and network routing algorithms. Designed with a dark, cyberpunk/hacker aesthetic, this project serves as a comprehensive demonstration of mathematical ciphers and Dijkstra's Algorithm.

---

## 🔗 Live Mission Link
**[https://enigma-nine-ruby.vercel.app/]**

---

## 🎯 Mission Objectives (Features)

This application features a custom state-machine routing system that seamlessly transitions between three primary mission phases:

1. **Mission Briefing:** A cinematic boot-sequence and encrypted payload interception.
2. **Encryption Lab:** - **Caesar Cipher:** Features an interactive, physics-based SVG Alphabet Dial to visualize modular arithmetic `(x + k) mod 26`.
   - **Affine Cipher:** Demonstrates multiplicative and additive keys `(ax + b) mod 26` with coprimality validation.
   - **Brute Force Decoder:** A simulated terminal exhaustively searching the key space to crack the intercepted transmission.
3. **Spy Network Topology (Dijkstra's Algorithm):**
   - An interactive visualizer demonstrating Dijkstra's shortest path algorithm.
   - Calculates the safest route for a field agent through a weighted graph in real-time.
   - The final path cost is utilized as the key to decrypt the ultimate mission payload.

---

## 🛠️ Tech Stack
- **Framework:** React + Vite
- **Styling:** Tailwind CSS (v3)
- **Animations:** Framer Motion
- **Icons & Graphics:** Custom SVG manipulations (Interactive DOM & Graphing)

---

## 💻 Local Agent Setup

If you prefer to review the source code and run this project locally, execute the following commands in your terminal:

```bash
# 1. Clone the repository
git clone [https://github.com/YOUR-USERNAME/enigma---dm.git](https://github.com/YOUR-USERNAME/enigma---dm.git)

# 2. Navigate to the project directory
cd enigma---dm/Cryptography

# 3. Install dependencies
npm install

# 4. Initiate local dev server
npm run dev
