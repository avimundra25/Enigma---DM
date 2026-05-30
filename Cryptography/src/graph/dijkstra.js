/**
 * Dijkstra's Shortest Path Algorithm — Project ENIGMA
 * 
 * Finds the shortest (safest) communication path through the spy network.
 * Returns step-by-step execution data for animated visualization.
 * 
 * Graph Theory concepts:
 * - Weighted undirected graph G = (V, E, w)
 * - Vertices = spy agents, Edges = communication channels
 * - Edge weights = risk/cost of using that channel
 * - Dijkstra finds the minimum-weight path from source to all vertices
 */

/**
 * The spy network graph definition.
 * 8 agents connected by weighted communication channels.
 * 
 * Layout is designed for visual clarity on screen.
 */
export const SPY_NETWORK = {
  nodes: [
    { id: 'PHANTOM', x: 80, y: 200, description: 'Field Commander' },
    { id: 'VIPER', x: 250, y: 80, description: 'Intel Analyst' },
    { id: 'ECHO', x: 250, y: 320, description: 'Signal Interceptor' },
    { id: 'RAVEN', x: 420, y: 140, description: 'Double Agent' },
    { id: 'SPECTRE', x: 420, y: 280, description: 'Cyber Operative' },
    { id: 'GHOST', x: 590, y: 80, description: 'Infiltration Expert' },
    { id: 'CIPHER', x: 590, y: 320, description: 'Codebreaker' },
    { id: 'SHADOW', x: 760, y: 200, description: 'Mission Target' },
  ],
  edges: [
    { from: 'PHANTOM', to: 'VIPER', weight: 4 },
    { from: 'PHANTOM', to: 'ECHO', weight: 2 },
    { from: 'VIPER', to: 'RAVEN', weight: 5 },
    { from: 'VIPER', to: 'ECHO', weight: 1 },
    { from: 'ECHO', to: 'SPECTRE', weight: 3 },
    { from: 'ECHO', to: 'RAVEN', weight: 8 },
    { from: 'RAVEN', to: 'GHOST', weight: 2 },
    { from: 'RAVEN', to: 'SPECTRE', weight: 1 },
    { from: 'SPECTRE', to: 'CIPHER', weight: 4 },
    { from: 'SPECTRE', to: 'GHOST', weight: 6 },
    { from: 'GHOST', to: 'SHADOW', weight: 3 },
    { from: 'CIPHER', to: 'SHADOW', weight: 2 },
    { from: 'RAVEN', to: 'SHADOW', weight: 9 },
    { from: 'VIPER', to: 'GHOST', weight: 7 },
  ],
};

/**
 * Build an adjacency list from the edge list.
 * Since our spy network is undirected, each edge creates two entries.
 * 
 * @param {Array} edges - Array of { from, to, weight }
 * @returns {Object} Adjacency list: { nodeId: [{ neighbor, weight }] }
 */
export const buildAdjacencyList = (edges) => {
  const adj = {};
  for (const { from, to, weight } of edges) {
    if (!adj[from]) adj[from] = [];
    if (!adj[to]) adj[to] = [];
    adj[from].push({ neighbor: to, weight });
    adj[to].push({ neighbor: from, weight });
  }
  return adj;
};

/**
 * Run Dijkstra's algorithm with step-by-step recording for visualization.
 * 
 * Each step records:
 * - Which node is being processed
 * - Which edges are being relaxed
 * - The current distance table
 * - The current visited set
 * 
 * @param {Object} graph - { nodes, edges } 
 * @param {string} source - Source node ID
 * @returns {{ distances, previous, steps, path }}
 */
export const dijkstra = (graph, source, target) => {
  const adj = buildAdjacencyList(graph.edges);
  const nodeIds = graph.nodes.map(n => n.id);

  // Initialize distances to Infinity, source to 0
  const distances = {};
  const previous = {};
  const visited = new Set();
  const steps = [];

  for (const id of nodeIds) {
    distances[id] = Infinity;
    previous[id] = null;
  }
  distances[source] = 0;

  // Record initial state
  steps.push({
    type: 'init',
    message: `Initialize: Set dist[${source}] = 0, all others = ∞`,
    currentNode: null,
    distances: { ...distances },
    visited: new Set(visited),
    relaxedEdges: [],
    updatedNodes: [],
  });

  while (visited.size < nodeIds.length) {
    // Find unvisited node with minimum distance (priority queue substitute)
    let currentNode = null;
    let minDist = Infinity;
    for (const id of nodeIds) {
      if (!visited.has(id) && distances[id] < minDist) {
        minDist = distances[id];
        currentNode = id;
      }
    }

    if (currentNode === null) break; // All remaining nodes unreachable

    visited.add(currentNode);

    // Record: selecting current node
    steps.push({
      type: 'visit',
      message: `Visit ${currentNode} (distance = ${distances[currentNode]})`,
      currentNode,
      distances: { ...distances },
      visited: new Set(visited),
      relaxedEdges: [],
      updatedNodes: [],
    });

    // Relax all neighbors
    const neighbors = adj[currentNode] || [];
    const relaxedEdges = [];
    const updatedNodes = [];

    for (const { neighbor, weight } of neighbors) {
      if (visited.has(neighbor)) continue;

      const newDist = distances[currentNode] + weight;
      const oldDist = distances[neighbor];

      if (newDist < oldDist) {
        distances[neighbor] = newDist;
        previous[neighbor] = currentNode;
        relaxedEdges.push({ from: currentNode, to: neighbor, weight, newDist });
        updatedNodes.push(neighbor);
      }
    }

    if (relaxedEdges.length > 0) {
      steps.push({
        type: 'relax',
        message: `Relax edges from ${currentNode}: ${relaxedEdges.map(e => `${e.to}(${e.newDist})`).join(', ')}`,
        currentNode,
        distances: { ...distances },
        visited: new Set(visited),
        relaxedEdges,
        updatedNodes,
      });
    }

    // Early exit if we reached the target
    if (currentNode === target) break;
  }

  // Reconstruct shortest path
  const path = reconstructPath(previous, target);
  const pathWeight = distances[target];

  steps.push({
    type: 'done',
    message: `Shortest path found: ${path.join(' → ')} (total cost: ${pathWeight})`,
    currentNode: null,
    distances: { ...distances },
    visited: new Set(visited),
    relaxedEdges: [],
    updatedNodes: [],
    path,
    pathWeight,
  });

  return { distances, previous, steps, path, pathWeight };
};

/**
 * Reconstruct the shortest path from source to target
 * by following the 'previous' pointers backwards.
 * 
 * @param {Object} previous - Map of node → preceding node
 * @param {string} target - Target node ID
 * @returns {string[]} Ordered path from source to target
 */
export const reconstructPath = (previous, target) => {
  const path = [];
  let current = target;
  while (current !== null) {
    path.unshift(current);
    current = previous[current];
  }
  return path;
};
