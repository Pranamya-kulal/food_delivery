const express = require('express');
const app = express();

app.use(express.json());

let ordersQueue = [];
const graph = {};

// Function to establish a route between two locations
function createRoute(from, to, distance) {
  if (!graph[from]) graph[from] = [];
  graph[from].push({ to, distance });
}

// Function to find the shortest path using Dijkstra's algorithm
function calculateShortestPath(start, end) {
  const distances = {};
  const visited = new Set();
  const priorityQueue = [];

  for (let location in graph) {
    distances[location] = Infinity;
  }
  distances[start] = 0;

  priorityQueue.push({ location: start, distance: 0 });

  while (priorityQueue.length > 0) {
    priorityQueue.sort((a, b) => a.distance - b.distance);
    const { location: current, distance } = priorityQueue.shift();

    if (visited.has(current)) continue;
    visited.add(current);

    if (current === end) break;

    for (let neighbor of graph[current] || []) {
      const newDistance = distance + neighbor.distance;
      if (newDistance < distances[neighbor.to]) {
        distances[neighbor.to] = newDistance;
        priorityQueue.push({ location: neighbor.to, distance: newDistance });
      }
    }
  }

  return distances[end] === Infinity ? -1 : distances[end];
}

// Routes

app.post('/add-order', (req, res) => {
  const { orderId, customerLocation } = req.body;
  ordersQueue.push({ orderId, customerLocation });
  res.json({ message: 'Order added', ordersQueue });
});

app.post('/process-order', (req, res) => {
  if (ordersQueue.length === 0) {
    return res.json({ message: 'No orders to process' });
  }

  const nextOrder = ordersQueue.shift();
  res.json({ message: 'Order in process', order: nextOrder });
});

app.post('/add-route', (req, res) => {
  const { from, to, distance } = req.body;
  createRoute(from, to, distance);
  res.json({ message: 'Route added', graph });
});

app.get('/shortest-route', (req, res) => {
  const { start, end } = req.query;
  const shortestDistance = calculateShortestPath(start, end);

  if (shortestDistance === -1) {
    return res.json({ message: 'No route found' });
  }

  res.json({ message: 'Shortest route found', distance: shortestDistance });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is up and running at http://localhost:${PORT}`);
});
