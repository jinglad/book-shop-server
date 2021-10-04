const express = require("express");
const mongodb = require("mongodb");
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());

app.listen(5000, () => {
  console.log("connected at port 5000");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vpsgc.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  const usersCollection = client.db(process.env.DB_NAME).collection("users");

  app.post("/users", (req, res) => {
    const { name, email } = req.body;
    console.log(name, email);
    usersCollection.insertOne({ name, email }).then((result) => {
      console.log(result);
      res.send(result.insertedCount > 0);
    });
  });
});
