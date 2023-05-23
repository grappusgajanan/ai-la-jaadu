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
      const prompt = msg.prompt;
      console.log("running prompt", prompt);
      fetch("http://localhost:4300/chat", {
        method: "POST",
        body: JSON.stringify({ prompt }),
        headers: { "Content-type": "application/json; charset=UTF-8" },
      })
        .then((response) => response.json())
        // .then(async (mermaidCode) => {
        //   console.log("mermaid code", mermaidCode);
        //   fetch("http://localhost:4300/chat", {
        //     method: "POST",
        //     body: JSON.stringify({
        //       prompt:
        //         'for below given mermaid code, make a graph in JSON representation having this structure \n"{nodes : [{id, text, shape, x, y, width, height}], edges : [{source, destination}]}"\n x, y, width, height should be integer numbers representing co-ordinates and dimensions of the node, imagine these nodes are placed in a 2000px X 2000px square where top-left co-ordinates are 0,0 and choose co-ordinates and dimensions of nodes accordingly such that it looks like a normal flowchart, respond with only JSON code, do not include any explaination or any other text, do not enclose JSON in any characters\n\n mermaid code:\n' +
        //         mermaidCode.text,
        //     }),
        //     headers: { "Content-type": "application/json; charset=UTF-8" },
        //   })
        //     .then((res) => res.json())
        .then((graph) => {
          try {
            console.log("object graph created by GPT", graph);
            drawGraph(graph);
          } catch (er) {
            console.error("ERROR :: ", er);
          }
        });
      // });
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
      id: "one",
      text: "Start",
      shape: "rectangle",
      width: 80,
      height: 30,
      label: "Start",
      x: 92.5,
      y: 0,
    },
    {
      id: "two",
      text: "Check\nPayment\nStatus",
      shape: "diamond",
      width: 100,
      height: 70,
      label: "Check\nPayment\nStatus",
      x: 82.5,
      y: 80,
    },
    {
      id: "three",
      text: "Process\nPayment",
      shape: "rectangle",
      width: 100,
      height: 50,
      label: "Process\nPayment",
      x: 82.5,
      y: 200,
    },
    {
      id: "four",
      text: "Payment\nSuccessful",
      shape: "rectangle",
      width: 110,
      height: 40,
      label: "Payment\nSuccessful",
      x: 0,
      y: 300,
    },
    {
      id: "five",
      text: "Payment\nFailed",
      shape: "rectangle",
      width: 100,
      height: 40,
      label: "Payment\nFailed",
      x: 160,
      y: 300,
    },
    {
      id: "six",
      text: "End",
      shape: "rectangle",
      width: 80,
      height: 30,
      label: "End",
      x: 92.5,
      y: 390,
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
