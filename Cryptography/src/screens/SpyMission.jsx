import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScanlineOverlay from '../components/ScanlineOverlay';
import GlitchText from '../components/GlitchText';
import TerminalText from '../components/TerminalText';
import { SPY_NETWORK, dijkstra } from '../graph/dijkstra.js';
import { affineEncrypt } from '../cipher/affine.js';

/* ────────────────────────────────────────────────────────────
   FINAL SPY MISSION SCREEN (Screen 3)
   Dijkstra's Algorithm Visualization + Final Affine Decrypt
   ──────────────────────────────────────────────────────────── */

const FINAL_PLAINTEXT = "OPERATION SUCCESSFUL: ROGUE AGENT NETWORK DISMANTLED. SECURE CHANNEL CLOSED.";

const SpyMission = () => {
  const [graphState, setGraphState] = useState({
    distances: {},
    visited: new Set(),
    currentNode: null,
    relaxedEdges: [],
    updatedNodes: [],
    path: [],
    pathWeight: null,
  });

  const [logs, setLogs] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showFinalDecryption, setShowFinalDecryption] = useState(false);
  const [finalMessageDecrypted, setFinalMessageDecrypted] = useState(false);

  const logsEndRef = useRef(null);

  // Initialize distances to Infinity
  useEffect(() => {
    const initialDistances = {};
    SPY_NETWORK.nodes.forEach(n => { initialDistances[n.id] = Infinity; });
    initialDistances['PHANTOM'] = 0; // Source
    setGraphState(prev => ({ ...prev, distances: initialDistances }));
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const runVisualization = useCallback(() => {
    if (isAnimating || isFinished) return;
    setIsAnimating(true);
    setLogs([{ time: new Date().toLocaleTimeString(), text: "> INITIATING DIJKSTRA'S SHORTEST PATH PROTOCOL" }]);
    
    const { steps } = dijkstra(SPY_NETWORK, 'PHANTOM', 'SHADOW');
    let currentStep = 0;

    const intervalId = setInterval(() => {
      if (currentStep >= steps.length) {
        clearInterval(intervalId);
        setIsAnimating(false);
        setIsFinished(true);
        setTimeout(() => setShowFinalDecryption(true), 2000);
        return;
      }

      const step = steps[currentStep];
      setGraphState({
        distances: step.distances,
        visited: step.visited,
        currentNode: step.currentNode,
        relaxedEdges: step.relaxedEdges,
        updatedNodes: step.updatedNodes,
        path: step.path || [],
        pathWeight: step.pathWeight || null,
      });

      setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), text: `> ${step.message}` }]);
      currentStep++;
    }, 800);

  }, [isAnimating, isFinished]);

  const reset = () => {
    const initialDistances = {};
    SPY_NETWORK.nodes.forEach(n => { initialDistances[n.id] = Infinity; });
    initialDistances['PHANTOM'] = 0;
    
    setGraphState({
      distances: initialDistances,
      visited: new Set(),
      currentNode: null,
      relaxedEdges: [],
      updatedNodes: [],
      path: [],
      pathWeight: null,
    });
    setLogs([]);
    setIsAnimating(false);
    setIsFinished(false);
    setShowFinalDecryption(false);
    setFinalMessageDecrypted(false);
  };

  // Node position helpers
  const getNodePos = (id) => {
    const node = SPY_NETWORK.nodes.find(n => n.id === id);
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white overflow-hidden p-6 pt-20">
      <ScanlineOverlay />

      <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row gap-6 h-[calc(100vh-3rem)]">
        
        {/* LEFT PANEL — GRAPH VISUALIZATION */}
        <div className="w-full md:w-3/5 flex flex-col bg-[#0d0d14]/80 border border-[#00d4ff]/20 rounded-xl overflow-hidden backdrop-blur-sm relative">
          
          <div className="p-4 border-b border-[#00d4ff]/20 bg-[#00d4ff]/5 flex justify-between items-center">
            <h2 className="font-[Orbitron] text-[#00d4ff] tracking-widest text-sm">SPY NETWORK TOPOLOGY</h2>
            <div className="flex gap-2">
              <span className="flex items-center text-xs text-[#ffffff50] font-mono"><div className="w-2 h-2 rounded-full bg-[#ffb000] mr-2"></div>VISITING</span>
              <span className="flex items-center text-xs text-[#ffffff50] font-mono"><div className="w-2 h-2 rounded-full bg-[#00ff41] mr-2"></div>SECURED</span>
            </div>
          </div>

          <div className="flex-1 relative w-full h-full min-h-[400px]">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 840 400" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00d4ff" strokeWidth="0.5" strokeOpacity="0.1"/>
                </pattern>
                <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* EDGES */}
              {SPY_NETWORK.edges.map((edge, i) => {
                const pos1 = getNodePos(edge.from);
                const pos2 = getNodePos(edge.to);
                const isRelaxed = graphState.relaxedEdges.some(re => 
                  (re.from === edge.from && re.to === edge.to) || (re.from === edge.to && re.to === edge.from)
                );
                const isOnPath = graphState.path.includes(edge.from) && graphState.path.includes(edge.to) &&
                  Math.abs(graphState.path.indexOf(edge.from) - graphState.path.indexOf(edge.to)) === 1;

                let stroke = "#ffffff20";
                let strokeWidth = "2";
                let classes = "transition-all duration-500";

                if (isOnPath) {
                  stroke = "#00d4ff";
                  strokeWidth = "4";
                  classes += " edge-path-active filter drop-shadow-[0_0_8px_rgba(0,212,255,0.8)]";
                } else if (isRelaxed) {
                  stroke = "#ffb000";
                  strokeWidth = "3";
                  classes += " filter drop-shadow-[0_0_8px_rgba(255,176,0,0.8)]";
                }

                return (
                  <g key={`edge-${i}`}>
                    <line 
                      x1={pos1.x} y1={pos1.y} 
                      x2={pos2.x} y2={pos2.y} 
                      stroke={stroke} strokeWidth={strokeWidth} 
                      className={classes}
                    />
                    {/* Edge weight label */}
                    <rect 
                      x={(pos1.x + pos2.x)/2 - 10} y={(pos1.y + pos2.y)/2 - 10} 
                      width="20" height="20" rx="10" 
                      fill="#0d0d14" stroke={stroke} strokeWidth="1"
                      className="transition-colors duration-500"
                    />
                    <text 
                      x={(pos1.x + pos2.x)/2} y={(pos1.y + pos2.y)/2} 
                      fill={isOnPath ? "#00d4ff" : (isRelaxed ? "#ffb000" : "#ffffff70")} 
                      fontSize="10" fontFamily="'JetBrains Mono'" textAnchor="middle" dominantBaseline="central"
                      className="transition-colors duration-500"
                    >
                      {edge.weight}
                    </text>
                  </g>
                );
              })}

              {/* NODES */}
              {SPY_NETWORK.nodes.map((node, i) => {
                const isCurrent = graphState.currentNode === node.id;
                const isVisited = graphState.visited.has(node.id);
                const isUpdated = graphState.updatedNodes.includes(node.id);
                const isOnPath = graphState.path.includes(node.id);
                const dist = graphState.distances[node.id];

                let fill = "#1a1a2e";
                let stroke = "#00d4ff40";
                let strokeWidth = "2";
                let filter = "";
                let r = 24;

                if (isOnPath) {
                  fill = "#00d4ff20";
                  stroke = "#00d4ff";
                  strokeWidth = "3";
                  filter = "url(#glow-cyan)";
                  r = 28;
                } else if (isCurrent) {
                  fill = "#ffb00020";
                  stroke = "#ffb000";
                  strokeWidth = "3";
                  r = 28;
                } else if (isVisited) {
                  fill = "#00ff4120";
                  stroke = "#00ff41";
                  strokeWidth = "2";
                } else if (isUpdated) {
                  fill = "#ffb00010";
                  stroke = "#ffb00080";
                }

                return (
                  <g key={`node-${i}`} className="transition-all duration-500" style={{ transformOrigin: `${node.x}px ${node.y}px` }}>
                    <circle 
                      cx={node.x} cy={node.y} r={r} 
                      fill={fill} stroke={stroke} strokeWidth={strokeWidth}
                      filter={filter}
                      className={isOnPath ? "node-pulse" : ""}
                    />
                    
                    {/* Node ID */}
                    <text x={node.x} y={node.y + 40} fill="#ffffff" fontSize="11" fontFamily="'Orbitron'" textAnchor="middle" className="tracking-wider drop-shadow-md">
                      {node.id}
                    </text>
                    
                    {/* Role */}
                    <text x={node.x} y={node.y + 54} fill="#ffffff50" fontSize="9" fontFamily="'JetBrains Mono'" textAnchor="middle">
                      {node.description}
                    </text>

                    {/* Distance Badge */}
                    <rect x={node.x - 20} y={node.y - 44} width="40" height="16" rx="4" fill="#00000080" stroke={stroke} strokeWidth="1"/>
                    <text x={node.x} y={node.y - 36} fill={dist === Infinity ? '#ffffff40' : (isOnPath ? '#00d4ff' : '#00ff41')} fontSize="10" fontFamily="'JetBrains Mono'" textAnchor="middle" dominantBaseline="central">
                      {dist === Infinity ? '∞' : dist}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* RIGHT PANEL — CONTROLS & LOGS */}
        <div className="w-full md:w-2/5 flex flex-col gap-4">
          
          {/* Mission Control Panel */}
          <div className="bg-[#0d0d14]/80 border border-[#ffffff10] rounded-xl p-6 backdrop-blur-sm shadow-xl">
            <h3 className="font-[Orbitron] text-lg text-[#00ff41] mb-2">MISSION: SECURE ROUTE</h3>
            <p className="text-[#ffffff70] font-mono text-sm mb-6">
              Identify the safest communication path from <span className="text-[#00d4ff]">PHANTOM</span> to <span className="text-[#00d4ff]">SHADOW</span> using Dijkstra's Algorithm.
            </p>
            
            <div className="flex gap-4">
              <button 
                onClick={runVisualization} 
                disabled={isAnimating || isFinished}
                className="flex-1 py-3 bg-[#00d4ff]/10 border border-[#00d4ff] text-[#00d4ff] font-[Orbitron] rounded hover:bg-[#00d4ff]/20 disabled:opacity-50 transition-colors shadow-[0_0_15px_rgba(0,212,255,0.2)] pulse-glow"
              >
                {isAnimating ? 'EXECUTING...' : (isFinished ? 'COMPLETED' : 'RUN DIJKSTRA')}
              </button>
              <button 
                onClick={reset}
                disabled={isAnimating}
                className="px-6 py-3 border border-[#ffffff20] text-[#ffffff70] font-[Orbitron] rounded hover:bg-[#ffffff10] disabled:opacity-50 transition-colors"
              >
                RESET
              </button>
            </div>
          </div>

          {/* Distance Table */}
          <div className="bg-[#0d0d14]/80 border border-[#ffffff10] rounded-xl p-4 backdrop-blur-sm flex-1 max-h-[35%] overflow-y-auto custom-scrollbar">
             <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="text-[#ffffff50] border-b border-[#ffffff10]">
                    <th className="pb-2 font-normal">AGENT</th>
                    <th className="pb-2 font-normal">DISTANCE</th>
                    <th className="pb-2 font-normal">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {SPY_NETWORK.nodes.map(n => {
                    const dist = graphState.distances[n.id];
                    const isVisited = graphState.visited.has(n.id);
                    return (
                      <tr key={n.id} className={`border-b border-[#ffffff05] ${graphState.currentNode === n.id ? 'bg-[#ffb000]/10 text-[#ffb000]' : (isVisited ? 'text-[#00ff41]' : 'text-[#ffffff80]')}`}>
                        <td className="py-2">{n.id}</td>
                        <td className="py-2">{dist === Infinity ? '∞' : dist}</td>
                        <td className="py-2">{isVisited ? 'SECURED' : (dist !== Infinity ? 'DISCOVERED' : 'UNKNOWN')}</td>
                      </tr>
                    );
                  })}
                </tbody>
             </table>
          </div>

          {/* Terminal Console */}
          <div className="bg-black border border-[#00ff41]/30 rounded-xl p-4 flex-1 font-mono text-xs overflow-y-auto shadow-[inset_0_0_20px_rgba(0,255,65,0.05)]">
            <div className="text-[#00ff41]/50 mb-2 border-b border-[#00ff41]/20 pb-2">
              ENIGMA.SYS.LOG // DIJKSTRA ENGINE
            </div>
            <div className="space-y-1">
              {logs.map((log, i) => (
                <div key={i} className="text-[#00ff41]">
                  <span className="text-[#ffffff30] mr-2">[{log.time}]</span>
                  {log.text}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>

        </div>
      </div>

      {/* FINAL DECRYPTION MODAL */}
      <AnimatePresence>
        {showFinalDecryption && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-[#0a0a0f] border border-[#ff0040]/50 rounded-2xl max-w-2xl w-full p-8 shadow-[0_0_50px_rgba(255,0,64,0.15)] relative overflow-hidden"
            >
              <ScanlineOverlay />
              
              <button 
                onClick={() => setShowFinalDecryption(false)}
                className="absolute top-4 right-4 z-20 text-[#ffffff40] hover:text-[#ff0040] transition-colors cursor-pointer p-2 font-mono text-xl"
                aria-label="Close modal"
              >
                ✕
              </button>
              
              {!finalMessageDecrypted ? (
                <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                  <h2 className="font-[Orbitron] text-2xl text-[#ff0040] tracking-widest uppercase">
                    Final Encrypted Payload Detected
                  </h2>
                  <p className="font-mono text-[#ffffff70] text-sm leading-relaxed">
                    The path to SHADOW has been secured. Total risk cost: <span className="text-[#00d4ff] font-bold">{graphState.pathWeight}</span>.
                    <br/><br/>
                    A final transmission requires decryption using the Affine Cipher.
                    The path cost (<span className="text-[#00d4ff]">{graphState.pathWeight}</span>) serves as the additive key 'b'.
                  </p>
                  
                  <div className="bg-black/50 border border-[#ff0040]/30 p-4 rounded w-full font-mono text-[#ff0040] text-center tracking-widest break-all">
                    {graphState.pathWeight !== null ? affineEncrypt(FINAL_PLAINTEXT, 5, graphState.pathWeight).text : "..."}
                  </div>

                  <div className="text-[#ffb000] font-mono text-sm">
                    a = 5 | b = {graphState.pathWeight}
                  </div>

                  <button 
                    onClick={() => setFinalMessageDecrypted(true)}
                    className="mt-4 px-8 py-4 bg-[#ff0040]/10 border border-[#ff0040] text-[#ff0040] font-[Orbitron] rounded-lg hover:bg-[#ff0040]/20 hover:shadow-[0_0_20px_rgba(255,0,64,0.3)] transition-all uppercase tracking-widest"
                  >
                    Initiate Decryption Sequence
                  </button>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="relative z-10 flex flex-col items-center text-center space-y-8 py-4"
                >
                  <GlitchText text="MISSION COMPLETE" className="text-4xl md:text-5xl font-[Orbitron] font-bold text-[#00ff41]" duration={2} />
                  
                  <div className="bg-[#00ff41]/10 border border-[#00ff41] p-6 rounded w-full shadow-[0_0_30px_rgba(0,255,65,0.2)] min-h-[100px] flex items-center justify-center">
                    <TerminalText
                      lines={[FINAL_PLAINTEXT]}
                      speed={50}
                      prefix="> "
                      className="text-lg md:text-xl font-bold tracking-widest"
                    />
                  </div>
                  
                  <p className="font-mono text-[#ffffff60] text-sm max-w-md mx-auto">
                    Excellent work, Agent. You successfully navigated the network and decrypted all classified intel using group theory principles.
                  </p>

                  <button 
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 border-b border-[#ffffff40] text-[#ffffff80] font-[Orbitron] hover:text-white hover:border-white transition-colors"
                  >
                    RESTART SYSTEM
                  </button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpyMission;
