const express = require("express");
const mongodb = require("mongodb");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const fileUpload = require("express-fileupload");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId

const app = express();

app.use(express.json());
app.use(cors());
app.use(fileUpload());
app.use(express.static("images"));

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
  const booksCollection = client.db(process.env.DB_NAME).collection("books");
  const ordersCollection = client.db(process.env.DB_NAME).collection("orders");
  const adminsCollection = client.db(process.env.DB_NAME).collection("admins");

  app.post("/users", (req, res) => {
    const { name, email } = req.body;
    // console.log(name, email);
    usersCollection.insertOne({ name, email }).then((result) => {
      // console.log(result);
      res.send(result.insertedCount > 0);
    });
  });

  app.post("/add-book", (req, res) => {
    const file = req.files.file;
    const { name, author, price } = req.body;
    const image = file.name;

    // storing the image
    file.mv(`${__dirname}/images/${file.name}`, (err) => {
      if (err) {
        console.log(err);
        return res.status(500).send({ msg: "Failed to upload" });
      }
    });

    booksCollection.insertOne({ name, author, price, image }).then((result) => {
      res.send(result.insertedCount > 0);
    });

  });

  app.get("/books", (req, res) => {
    booksCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.delete("/deleteBook/:id", (req, res) => {
    const {id} = req.params;
    booksCollection.deleteOne({_id: ObjectId(id)})
    .then(result => {
      // console.log(result);
      res.send(result.deletedCount > 0);
    })
  })

  app.patch("/updateBook/:id", (req, res) => {
    const {id} = req.params;
    const file = req.files.file;
    const { name, author, price } = req.body;
    const image = file.name;

    // storing the image
    file.mv(`${__dirname}/images/${file.name}`, (err) => {
      if (err) {
        console.log(err);
        return res.status(500).send({ msg: "Failed to upload" });
      }
    });

    booksCollection.updateOne({_id:ObjectId(id)},
    {
      $set: {name:name, author:author, price:price, image:image}
    })
    .then(result => {
      // console.log(result);
      res.send(result.modifiedCount > 0);
    })
  })

  app.post("/order", (req, res) => {
    const {email, books} = req.body;
    ordersCollection.insertOne({email, books}).then((result) => {
      res.send(result.insertedCount > 0)
    })
  })

  app.get("/order", (req, res) => {
    const {email} = req.query;
    ordersCollection.find({email:email}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.get("/allOrder", (req, res) => {
    ordersCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/admin", (req, res) => {
    const {email} = req.body;
    adminsCollection.insertOne({email}).then((result) => {
      res.send(result.insertedCount > 0)
    })
  })

  app.get("/admin", (req, res) => {
    adminsCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    })
  })

});
