import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScanlineOverlay from '../components/ScanlineOverlay';

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

const TheoryManual = () => {
  const [activeTab, setActiveTab] = useState('crypto');
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [dijkstraStep, setDijkstraStep] = useState(0);

  const dijkstraSteps = [
    {
      desc: "Step 0: Initialization. Source node distance is 0. All other nodes are Infinity. No nodes visited.",
      table: [
        { node: 'Source', dist: '0', status: 'Unvisited' },
        { node: 'Node A', dist: '∞', status: 'Unvisited' },
        { node: 'Node B', dist: '∞', status: 'Unvisited' },
        { node: 'Target', dist: '∞', status: 'Unvisited' },
      ]
    },
    {
      desc: "Step 1: Process Source. Relax edges to neighbors. Node A distance becomes 9. Node B distance becomes 2. Source marked Visited.",
      table: [
        { node: 'Source', dist: '0', status: 'Visited (SECURED)' },
        { node: 'Node A', dist: '9', status: 'Unvisited (Discovered)' },
        { node: 'Node B', dist: '2', status: 'Unvisited (Discovered)' },
        { node: 'Target', dist: '∞', status: 'Unvisited' },
      ]
    },
    {
      desc: "Step 2: Process Node B (smallest unvisited distance). Relax edge to Node A. Node A distance updates from 9 to 5 (2 + 3). Edge Relaxed! Node B marked Visited.",
      table: [
        { node: 'Source', dist: '0', status: 'Visited (SECURED)' },
        { node: 'Node A', dist: '5', status: 'Unvisited (Updated)' },
        { node: 'Node B', dist: '2', status: 'Visited (SECURED)' },
        { node: 'Target', dist: '∞', status: 'Unvisited' },
      ]
    },
    {
      desc: "Step 3: Process Node A. Relax edge to Target. Target distance becomes 11 (5 + 6). Node A marked Visited.",
      table: [
        { node: 'Source', dist: '0', status: 'Visited (SECURED)' },
        { node: 'Node A', dist: '5', status: 'Visited (SECURED)' },
        { node: 'Node B', dist: '2', status: 'Visited (SECURED)' },
        { node: 'Target', dist: '11', status: 'Unvisited (Discovered)' },
      ]
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white overflow-hidden p-6 pt-24 font-mono">
      <ScanlineOverlay aria-hidden="true" />
      
      <div className="max-w-4xl mx-auto relative z-10 flex flex-col gap-6 h-full pb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-[#00ff41]/30 pb-4"
        >
          <h1 className="text-3xl md:text-4xl font-[Orbitron] font-bold text-[#00ff41] tracking-widest">
            FIELD MANUAL <span className="text-[#00ff41]/40">//</span> <span className="text-[#00d4ff]">THEORETICAL FOUNDATIONS</span>
          </h1>
          <p className="text-[#ffffff50] mt-2 text-sm uppercase tracking-widest">
            Classified Documentation — Interactive Operations Dashboard
          </p>
        </motion.div>

        {/* Custom Tabs */}
        <div className="flex gap-4 border-b border-[#ffffff10] pb-2">
          <button 
            onClick={() => setActiveTab('crypto')}
            className={`px-4 py-2 font-[Orbitron] text-sm uppercase tracking-wider transition-colors ${activeTab === 'crypto' ? 'text-[#00d4ff] border-b-2 border-[#00d4ff]' : 'text-[#ffffff50] hover:text-[#00d4ff]/70'}`}
          >
            Cryptography & Group Theory
          </button>
          <button 
            onClick={() => setActiveTab('dijkstra')}
            className={`px-4 py-2 font-[Orbitron] text-sm uppercase tracking-wider transition-colors ${activeTab === 'dijkstra' ? 'text-[#ff0040] border-b-2 border-[#ff0040]' : 'text-[#ffffff50] hover:text-[#ff0040]/70'}`}
          >
            Dijkstra's Pathfinding
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar pr-4 pb-20 max-h-[70vh]">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: CRYPTOGRAPHY */}
            {activeTab === 'crypto' && (
              <motion.section 
                key="crypto"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-[#0d0d14]/80 border border-[#00d4ff]/20 rounded-xl p-6 md:p-8 backdrop-blur-sm"
              >
                <h2 className="text-xl font-[Orbitron] text-[#00d4ff] mb-6 flex items-center gap-3">
                  <span className="w-2 h-2 bg-[#00d4ff] shadow-[0_0_8px_#00d4ff]"></span>
                  MODULAR ARITHMETIC & Z₂₆
                </h2>
                
                <div className="space-y-6 text-sm text-[#ffffff80] leading-relaxed">
                  
                  {/* Theoretical Concept */}
                  <div>
                    <h3 className="text-[#00ff41] font-bold uppercase tracking-widest mb-2 border-b border-[#ffffff10] pb-2">Theoretical Concept: Group Theory</h3>
                    <p className="mb-4">
                      <strong className="text-[#00d4ff]">Group Theory</strong> is the mathematical study of symmetry and algebraic structures. In cryptography, classical ciphers operate on a finite, cyclic group. The English alphabet (A-Z) is mapped to integers <code className="text-[#ffb000]">0-25</code>, creating the algebraic structure <strong className="text-white">Z₂₆</strong>. This cyclic group allows us to perform arithmetic operations that wrap around the alphabet seamlessly.
                    </p>
                  </div>

                  {/* Step-by-Step Methodology */}
                  <div>
                    <h3 className="text-[#00ff41] font-bold uppercase tracking-widest mb-2 border-b border-[#ffffff10] pb-2">Methodology: Features & Rules</h3>
                    <ul className="list-disc pl-5 space-y-2 mb-4 text-[#ffffffa0]">
                      <li><strong className="text-white">Caesar Cipher (Additive Key):</strong> Uses modular addition. A letter shifted past 'Z' wraps back to 'A'.</li>
                      <li><strong className="text-white">Affine Cipher (Multiplicative & Additive):</strong> Uses the formula <code className="text-[#00d4ff]">E(x) = (a·x + b) mod 26</code>.</li>
                      <li><strong className="text-white">Coprime Necessity:</strong> For the Affine cipher to be reversible (decrypted), the multiplicative key <code className="text-[#ffb000]">a</code> must be coprime to 26. This ensures a modular inverse exists within <strong className="text-white">Z₂₆</strong>.</li>
                    </ul>
                  </div>

                  {/* Interactive Z_26 Grid */}
                  <div className="bg-black/50 border border-[#00ff41]/20 p-6 rounded-lg mt-4 font-mono select-none">
                    <p className="text-[#00ff41] mb-4 uppercase tracking-wider text-xs">Interactive Mapping: Click a character to identify its Z₂₆ index</p>
                    <div className="grid grid-cols-7 sm:grid-cols-9 md:grid-cols-13 gap-2">
                      {ALPHABET.map((char, index) => {
                        const isSelected = selectedLetter?.char === char;
                        return (
                          <button
                            key={char}
                            onClick={() => setSelectedLetter({ char, index })}
                            className={`py-2 text-center rounded border transition-all cursor-pointer ${
                              isSelected 
                                ? 'bg-[#00d4ff]/20 border-[#00d4ff] text-[#00d4ff] shadow-[0_0_10px_rgba(0,212,255,0.3)]' 
                                : 'bg-[#0a0a0f] border-[#ffffff10] text-white hover:border-[#00d4ff]/50'
                            }`}
                          >
                            {char}
                          </button>
                        );
                      })}
                    </div>
                    
                    <div className="mt-6 h-12 flex items-center justify-center border border-[#ffffff10] rounded bg-[#0a0a0f]">
                      {selectedLetter ? (
                        <div className="text-[#00ff41] text-lg">
                          Character <strong className="text-white">'{selectedLetter.char}'</strong> maps to integer <strong className="text-[#00d4ff] text-xl">{selectedLetter.index}</strong> in Z₂₆.
                        </div>
                      ) : (
                        <div className="text-[#ffffff30] animate-pulse">Awaiting input...</div>
                      )}
                    </div>
                  </div>

                  {/* Real-World Applications */}
                  <div className="mt-8 pt-4 border-t border-[#00ff41]/20">
                    <h3 className="text-[#00ff41] font-bold uppercase tracking-widest mb-2">Real-World Applications</h3>
                    <p className="text-[#ffffffa0]">
                      While classical shift ciphers like Caesar and Affine are easily broken today, the foundational concepts of modular arithmetic and group theory they utilize laid the groundwork for modern asymmetric encryption. Algorithms like <strong className="text-white">RSA (Rivest-Shamir-Adleman)</strong> rely heavily on prime factorization and modular exponentiation within finite cyclic groups to secure the internet.
                    </p>
                  </div>
                </div>
              </motion.section>
            )}

            {/* TAB 2: DIJKSTRA */}
            {activeTab === 'dijkstra' && (
              <motion.section 
                key="dijkstra"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-[#0d0d14]/80 border border-[#ff0040]/30 rounded-xl p-6 md:p-8 backdrop-blur-sm shadow-[0_0_15px_rgba(255,0,64,0.05)]"
              >
                <h2 className="text-xl font-[Orbitron] text-[#ff0040] mb-6 flex items-center gap-3">
                  <span className="w-2 h-2 bg-[#ff0040] shadow-[0_0_8px_#ff0040]"></span>
                  DIJKSTRA'S ALGORITHM
                </h2>
                
                <div className="space-y-6 text-sm text-[#ffffff80] leading-relaxed">
                  
                  {/* Theoretical Concept */}
                  <div>
                    <h3 className="text-[#00ff41] font-bold uppercase tracking-widest mb-2 border-b border-[#ffffff10] pb-2">Theoretical Concept: Shortest Path</h3>
                    <p className="mb-4">
                      The core purpose of <strong className="text-[#ff0040]">Dijkstra's Algorithm</strong> is to find the absolute shortest path between a starting node and all other nodes in a graph. It operates strictly on graphs with non-negative edge weights, making it perfect for geographic or network routing where distances cannot be negative.
                    </p>
                  </div>

                  {/* Step-by-Step Methodology */}
                  <div>
                    <h3 className="text-[#00ff41] font-bold uppercase tracking-widest mb-2 border-b border-[#ffffff10] pb-2">Methodology: Edge Relaxation</h3>
                    <ul className="list-disc pl-5 space-y-2 mb-4 text-[#ffffffa0]">
                      <li><strong className="text-white">Initialization:</strong> Assign a tentative distance of 0 to the source node and Infinity (∞) to all other nodes.</li>
                      <li><strong className="text-white">Node Selection:</strong> Always select the unvisited node with the smallest tentative distance to process next.</li>
                      <li><strong className="text-white">Edge Relaxation:</strong> For the current node, calculate the distance to its unvisited neighbors. If the newly calculated distance is smaller than the known distance, update it.</li>
                      <li><strong className="text-white">Completion:</strong> Once a node's neighbors are fully evaluated, mark it as visited. It will never be evaluated again.</li>
                    </ul>
                  </div>

                  {/* Visual Dijkstra Cards / Mini-Table */}
                  <div className="bg-black/50 border border-[#ff0040]/20 p-6 rounded-lg mt-4 font-mono">
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-[#ff0040] uppercase tracking-wider text-xs">Simulated Edge Relaxation Table</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setDijkstraStep(Math.max(0, dijkstraStep - 1))}
                          disabled={dijkstraStep === 0}
                          className="px-3 py-1 border border-[#ffffff20] rounded hover:bg-[#ffffff10] disabled:opacity-30"
                        >
                          PREV
                        </button>
                        <button 
                          onClick={() => setDijkstraStep(Math.min(3, dijkstraStep + 1))}
                          disabled={dijkstraStep === 3}
                          className="px-3 py-1 border border-[#ff0040]/50 text-[#ff0040] rounded hover:bg-[#ff0040]/10 disabled:opacity-30"
                        >
                          NEXT STEP
                        </button>
                      </div>
                    </div>

                    <div className="min-h-[40px] text-[#00ff41] text-xs mb-4 border-l-2 border-[#00ff41]/50 pl-3">
                      {dijkstraSteps[dijkstraStep].desc}
                    </div>

                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#ffffff20] text-[#ffffff60]">
                          <th className="py-2">Node</th>
                          <th className="py-2">Shortest Distance</th>
                          <th className="py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence mode="popLayout">
                          {dijkstraSteps[dijkstraStep].table.map((row, i) => (
                            <motion.tr 
                              key={`${row.node}-${dijkstraStep}`}
                              initial={{ opacity: 0, backgroundColor: 'rgba(255,0,64,0.1)' }}
                              animate={{ opacity: 1, backgroundColor: 'rgba(0,0,0,0)' }}
                              transition={{ duration: 0.5 }}
                              className="border-b border-[#ffffff05]"
                            >
                              <td className="py-3 text-white">{row.node}</td>
                              <td className={`py-3 font-bold ${row.dist !== '∞' ? 'text-[#00d4ff]' : 'text-[#ffffff30]'}`}>{row.dist}</td>
                              <td className={`py-3 ${row.status.includes('SECURED') ? 'text-[#00ff41]' : row.status.includes('Updated') ? 'text-[#ffb000]' : 'text-[#ffffff50]'}`}>
                                {row.status}
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>

                  {/* Real-World Applications */}
                  <div className="mt-8 pt-4 border-t border-[#ff0040]/20">
                    <h3 className="text-[#ff0040] font-bold uppercase tracking-widest mb-2">Real-World Applications</h3>
                    <p className="text-[#ffffffa0]">
                      Dijkstra's Algorithm is one of the most widely used algorithms in modern computer science. It powers <strong className="text-white">GPS navigation systems</strong> to calculate the fastest driving routes, serves as the backbone for <strong className="text-white">IP routing protocols (like OSPF)</strong> to direct internet traffic efficiently, and optimizes connection pathways in global telecommunications networks.
                    </p>
                  </div>

                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TheoryManual;
