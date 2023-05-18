const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const l = console.log;
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
});

app.post("/chat", async (req, res) => {
  try {
    const { prompt } = req.body;
    console.log(prompt);
    l(1);
    const completion = await openai.createCompletion({
      prompt,
      model: "text-davinci-003",
      temperature: 0.9,
      max_tokens: 3500,
    });
    l(2);
    console.log(JSON.stringify(completion.data.choices[0]));
    res.send(JSON.stringify(completion.data.choices[0]));
    l(3);
  } catch (error) {
    l(4);
    console.error(error.response.data);
    res.send("error");
  }
});

app.post("/test", (req, res) => {
  res.send(req.body);
});
