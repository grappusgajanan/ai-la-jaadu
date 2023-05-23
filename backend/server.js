const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const l = console.log;
console.log(`${process.env.OPENAI_API_KEY}`);
const generateCoordinates = require("./generateCoordinates");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

app.listen(4300, () => {
  console.log("server started listening on 4300");
  console.log(`${process.env.OPENAI_API_KEY}`);
});

app.post("/chat", async (req, res) => {
  try {
    const { prompt } = req.body;
    const detailedPrompt = `create a JSON graph representation for following diagram description, 
    use this structure "{ nodes : [{id, text, shape, width, height}], edges : [{source, destination, text}]}",
    consider the length of text for each node while generating width and height, 
    assume the text will be in 24px font-size and 
    generate widths and heights such that entire text of each node will fit in that width and height 
    along with 50px padding on all sides, \n\n diagram description :: \n ${prompt} \n\n
    keep width and height as integer numbers,
    decision nodes should be in diamond shape, terminal nodes should be circle, use any of these : (triangle, left/right parallelogram, ellipse, square) for other
    different kinds of nodes 
    your response must only contain valid JSON and nothing else, 
    do not include any whitespace in your reponse.
`;
    console.log(prompt);
    l(1);
    const completion = await openai.createCompletion({
      prompt: detailedPrompt,
      model: "text-davinci-003",
      temperature: 0.4,
      max_tokens: 3500,
    });
    l(2);
    const maybeJSON = completion.data.choices[0].text;
    var json = {};
    try {
      json = JSON.parse(maybeJSON);
    } catch (error) {
      console.error("received invalid JSON from GPT, ", maybeJSON);
      console.error(error);
      res.statusCode(500);
      res.end();
    }
    res.send(JSON.stringify(generateCoordinates(json)));
    l(3);
  } catch (error) {
    l(4);
    console.error(error.response.data);
    res.send("error");
  }
});
