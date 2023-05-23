figma.loadFontAsync({ family: "Inter", style: "Medium" });
figma.showUI(__html__, {
  width: 400,
  height: 400,
  title: "Figma Plugin Test",
  visible: true,
});

figma.ui.onmessage = async (msg) => {
  switch (msg.type) {
    case "build": {
      const prompt =
        "make the following flowchart in mermaid syntax :\n\n" + msg.prompt;
      console.log("running prompt", prompt);
      fetch("http://localhost:4300/chat", {
        method: "POST",
        body: JSON.stringify({ prompt }),
        headers: { "Content-type": "application/json; charset=UTF-8" },
      })
        .then((response) => response.json())
        .then(async (mermaidCode) => {
          console.log("mermaid code", mermaidCode);
          fetch("http://localhost:4300/chat", {
            method: "POST",
            body: JSON.stringify({
              prompt:
                'for below given mermaid code, make a graph in JSON representation having this structure \n"{nodes : [{id, text, shape, x, y, width, height}], edges : [{source, destination}]}"\n x, y, width, height should be integer numbers representing co-ordinates and dimensions of the node, imagine these nodes are placed in a 2000px X 2000px square where top-left co-ordinates are 0,0 and choose co-ordinates and dimensions of nodes accordingly such that it looks like a normal flowchart, respond with only JSON code, do not include any explaination or any other text, do not enclose JSON in any characters\n\n mermaid code:\n' +
                mermaidCode.text,
            }),
            headers: { "Content-type": "application/json; charset=UTF-8" },
          })
            .then((res) => res.json())
            .then((res) => {
              try {
                let graph = res?.text;
                console.log("object graph created by GPT", graph);
                graph = JSON.parse(graph);
                drawGraph(graph);
              } catch (er) {
                console.error("ERROR :: ", er);
              }
            });
        });
      break;
    }
    case "test": {
      console.log("test message received");
      drawGraph(graph);
      break;
    }
    default: {
      console.log("unknown message received : ", msg);
    }
  }
};

async function drawGraph(graph: any) {
  console.log("inside draw graph, graph = ", graph);
  const { nodes, edges } = graph;
  await drawNodes(nodes);
  console.log(nodeIdToFigmaIdMap);
  drawEdges(edges);
}

async function drawNodes(nodes: any[]) {
  console.log("inside drawNodes");
  console.log("nodes :: ", nodes);
  const nodesArray: SceneNode[] = await Promise.all(nodes?.map(drawNode));
  figma.currentPage.selection = nodesArray;
  figma.viewport.scrollAndZoomIntoView(nodesArray);
}

function drawEdges(edges: Edge[]) {
  console.log("inside drawEdges");
  edges?.map((edge) => {
    drawEdge(edge);
  });
}

type Node = {
  x: number;
  y: number;
  shape: string;
  text: string;
  id: string;
  color: string;
  width: number;
  height: number;
};
type Edge = { source: string; destination: string; text: string };

const shapeToShapeTypeMap: { [key: string]: Shape } = {
  circle: "ELLIPSE",
  oval: "ELLIPSE",
  rect: "SQUARE",
  rectangle: "SQUARE",
  rounded_rectangle: "ROUNDED_RECTANGLE",
  "round-rectangle": "ROUNDED_RECTANGLE",
  diamond: "DIAMOND",
  triangle_up: "TRIANGLE_UP",
  triangle_down: "TRIANGLE_DOWN",
  parallelogram_right: "PARALLELOGRAM_RIGHT",
  parallelogram_left: "PARALLELOGRAM_LEFT",
};
const getShapeType = (shape: string): Shape =>
  shapeToShapeTypeMap[shape] ?? "ROUNDED_RECTANGLE";

type Shape =
  | "SQUARE"
  | "ELLIPSE"
  | "ROUNDED_RECTANGLE"
  | "DIAMOND"
  | "TRIANGLE_UP"
  | "TRIANGLE_DOWN"
  | "PARALLELOGRAM_RIGHT"
  | "PARALLELOGRAM_LEFT";

const nodeIdToFigmaIdMap: { [key: string]: any } = {};
async function drawNode(node: Node) {
  console.log("inside drawNode node = ", node);
  const shapeType = getShapeType(node.shape);
  const shape = figma.createShapeWithText();
  shape.shapeType = shapeType;
  shape.resize(parseInt(node.width + ""), parseInt(node.height + ""));
  shape.x = node.x + node.width;
  shape.y = node.y;
  await Promise.all(
    shape.text
      .getStyledTextSegments(["fontName"])
      .map(({ fontName }) => figma.loadFontAsync(fontName))
  );
  shape.text.characters = node.text;
  figma.currentPage.appendChild(shape);
  nodeIdToFigmaIdMap[node.id] = shape.id;
  console.log("shape id", shape.id);
  return shape;
}

function drawEdge(edge: Edge) {
  const { source, destination, text } = edge;
  console.log(source + "   --------->   " + destination);
  const connector = figma.createConnector();
  connector.strokeWeight = 2;

  connector.connectorStart = {
    endpointNodeId: nodeIdToFigmaIdMap[source],
    magnet: "AUTO",
  };

  connector.connectorEnd = {
    endpointNodeId: nodeIdToFigmaIdMap[destination],
    magnet: "AUTO",
  };
}

const graph = {
  nodes: [
    {
      id: "process1",
      x: 300,
      y: 100,
      width: 140,
      height: 60,
      shape: "rectangle",
      text: "process1",
    },
    {
      id: "subproc",
      x: 200,
      y: 200,
      width: 160,
      height: 60,
      shape: "rectangle",
      text: "Subprocess",
    },
    {
      id: "condition1",
      x: 300,
      y: 300,
      width: 140,
      height: 60,
      shape: "diamond",
      text: "Condition 1",
    },
    {
      id: "output1",
      x: 200,
      y: 400,
      width: 120,
      height: 60,
      shape: "rectangle",
      text: "Output 1",
    },
    {
      id: "output2",
      x: 400,
      y: 400,
      width: 120,
      height: 60,
      shape: "rectangle",
      text: "Output 2",
    },
  ],
  edges: [
    {
      source: "process1",
      destination: "subproc",
      text: "",
    },
    {
      source: "subproc",
      destination: "condition1",
      text: "",
    },
    {
      source: "condition1",
      destination: "output1",
      text: "Yes",
    },
    {
      source: "condition1",
      destination: "output2",
      text: "No",
    },
  ],
};

// const graph = {
//   nodes: [
//     {
//       id: "start",
//       x: 0,
//       y: 0,
//       width: 80,
//       height: 40,
//       shape: "rect",
//       text: "Start",
//     },
//     {
//       id: "process1",
//       x: 150,
//       y: 0,
//       width: 120,
//       height: 40,
//       shape: "rect",
//       text: "Process 1",
//     },
//     {
//       id: "process2",
//       x: 150,
//       y: 100,
//       width: 120,
//       height: 40,
//       shape: "rect",
//       text: "Process 2",
//     },
//     {
//       id: "decision",
//       x: 150,
//       y: 200,
//       width: 120,
//       height: 60,
//       shape: "diamond",
//       text: "Decision",
//     },
//     {
//       id: "subproc",
//       x: 300,
//       y: 0,
//       width: 120,
//       height: 40,
//       shape: "rect",
//       text: "Subprocess",
//     },
//     {
//       id: "condition1",
//       x: 450,
//       y: 0,
//       width: 120,
//       height: 40,
//       shape: "rect",
//       text: "Condition 1",
//     },
//     {
//       id: "output1",
//       x: 450,
//       y: 100,
//       width: 120,
//       height: 40,
//       shape: "rect",
//       text: "Output 1",
//     },
//     {
//       id: "output2",
//       x: 450,
//       y: 200,
//       width: 120,
//       height: 40,
//       shape: "rect",
//       text: "Output 2",
//     },
//     {
//       id: "subproc2",
//       x: 300,
//       y: 100,
//       width: 120,
//       height: 40,
//       shape: "rect",
//       text: "Subprocess 2",
//     },
//     {
//       id: "condition2",
//       x: 450,
//       y: 300,
//       width: 120,
//       height: 40,
//       shape: "rect",
//       text: "Condition 2",
//     },
//     {
//       id: "output3",
//       x: 450,
//       y: 400,
//       width: 120,
//       height: 40,
//       shape: "rect",
//       text: "Output 3",
//     },
//     {
//       id: "output4",
//       x: 450,
//       y: 500,
//       width: 120,
//       height: 40,
//       shape: "rect",
//       text: "Output 4",
//     },
//     {
//       id: "output5",
//       x: 600,
//       y: 0,
//       width: 120,
//       height: 40,
//       shape: "rect",
//       text: "Output 5",
//     },
//     {
//       id: "process3",
//       x: 600,
//       y: 100,
//       width: 120,
//       height: 40,
//       shape: "rect",
//       text: "Process 3",
//     },
//     {
//       id: "option1",
//       x: 600,
//       y: 200,
//       width: 120,
//       height: 60,
//       shape: "diamond",
//       text: "Option 1",
//     },
//     {
//       id: "output6",
//       x: 600,
//       y: 300,
//       width: 120,
//       height: 40,
//       shape: "rect",
//       text: "Output 6",
//     },
//     {
//       id: "process4",
//       x: 600,
//       y: 400,
//       width: 120,
//       height: 40,
//       shape: "rect",
//       text: "Process 4",
//     },
//     {
//       id: "output7",
//       x: 750,
//       y: 100,
//       width: 120,
//       height: 40,
//       shape: "rect",
//       text: "Output 7",
//     },
//     {
//       id: "output8",
//       x: 750,
//       y: 400,
//       width: 120,
//       height: 40,
//       shape: "rect",
//       text: "Output 8",
//     },
//     {
//       id: "end1",
//       x: 900,
//       y: 0,
//       width: 80,
//       height: 40,
//       shape: "rect",
//       text: "End 1",
//     },
//     {
//       id: "end2",
//       x: 900,
//       y: 200,
//       width: 80,
//       height: 40,
//       shape: "rect",
//       text: "End 2",
//     },
//     {
//       id: "end3",
//       x: 900,
//       y: 100,
//       width: 80,
//       height: 40,
//       shape: "rect",
//       text: "End 3",
//     },
//     {
//       id: "end4",
//       x: 900,
//       y: 400,
//       width: 80,
//       height: 40,
//       shape: "rect",
//       text: "End 4",
//     },
//     {
//       id: "option2",
//       x: 600,
//       y: 500,
//       width: 120,
//       height: 60,
//       shape: "diamond",
//       text: "Option 2",
//     },
//   ],
//   edges: [
//     { source: "start", destination: "process1", text: null },
//     { source: "start", destination: "process2", text: null },
//     { source: "start", destination: "decision", text: null },
//     { source: "process1", destination: "subproc", text: null },
//     { source: "subproc", destination: "condition1", text: null },
//     { source: "condition1", destination: "output1", text: "Yes" },
//     { source: "condition1", destination: "output2", text: "No" },
//     { source: "process2", destination: "subproc2", text: null },
//     { source: "subproc2", destination: "condition2", text: null },
//     { source: "condition2", destination: "output3", text: "Yes" },
//     { source: "condition2", destination: "output4", text: "No" },
//     { source: "decision", destination: "option1", text: null },
//     { source: "decision", destination: "option2", text: null },
//     { source: "option1", destination: "output5", text: "Selected" },
//     { source: "option1", destination: "process3", text: "Not Selected" },
//     { source: "option2", destination: "output6", text: "Selected" },
//     { source: "option2", destination: "process4", text: "Not Selected" },
//     { source: "process3", destination: "output7", text: null },
//     { source: "process4", destination: "output8", text: null },
//     { source: "output5", destination: "end1", text: null },
//     { source: "output6", destination: "end2", text: null },
//     { source: "output7", destination: "end3", text: null },
//     { source: "output8", destination: "end4", text: null },
//   ],
// };
