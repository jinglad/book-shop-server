const express = require("express");
const mongodb = require("mongodb");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

app.listen(5000, () => {
  console.log("connected at port 5000");
});
