// import dagre from "dagre";
const dagre = require("dagre");

const generateCoordinates = (graph) => {
  console.log("inside generateCoordinates", graph);
  const nodes = graph.nodes;
  const edges = graph.edges;

  var g = new dagre.graphlib.Graph();

  g.setGraph({});
  g.setDefaultEdgeLabel(function () {
    return {};
  });

  nodes.forEach((node) => {
    g.setNode(node.id, {
      label: node.text,
      width: node.width,
      height: node.height,
    });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.destination);
  });

  dagre.layout(g);
  console.log("\n\n\n dagree updated :: ", g);
  const newNodes = [];
  for (key in g._nodes) {
    const node = nodes.find((node) => node.id == key);
    const gNode = g._nodes[key];
    const width = gNode.width;
    const height = gNode.height;

    newNodes.push({
      ...node,
      ...g._nodes[key],
      x: gNode.x - width / 2,
      y: gNode.y - height / 2,
    });
  }
  return { nodes: newNodes, edges };
};
module.exports = generateCoordinates;

const dummyGraph = {
  nodes: [
    {
      id: "one",
      text: "Start",
      shape: "rectangle",
      width: 80,
      height: 30,
    },
    {
      id: "two",
      text: "Check\nPayment\nStatus",
      shape: "diamond",
      width: 100,
      height: 70,
    },
    {
      id: "three",
      text: "Process\nPayment",
      shape: "rectangle",
      width: 100,
      height: 50,
    },
    {
      id: "four",
      text: "Payment\nSuccessful",
      shape: "rectangle",
      width: 110,
      height: 40,
    },
    {
      id: "five",
      text: "Payment\nFailed",
      shape: "rectangle",
      width: 100,
      height: 40,
    },
    {
      id: "six",
      text: "End",
      shape: "rectangle",
      width: 80,
      height: 30,
    },
  ],
  edges: [
    {
      source: "one",
      destination: "two",
      text: "Payment\nPending",
    },
    {
      source: "two",
      destination: "three",
      text: "Payment\nNot\nProcessed",
    },
    {
      source: "three",
      destination: "four",
      text: "Payment\nProcessed",
    },
    {
      source: "three",
      destination: "five",
      text: "Payment\nFailed",
    },
    {
      source: "four",
      destination: "six",
      text: "Finish",
    },
    {
      source: "five",
      destination: "six",
      text: "Finish",
    },
  ],
};
