const express = require("express");
const app = express();
const PORT = process.env.PORT_ONE || 7071;

const isAuthenticated = require("../../auth-middleware/isAuthenticated");

const amqp = require("amqplib");
var channel, connection;
const mongoose = require("mongoose");
const Product = require("./models/Product");
const { createProduct } = require("./controllers/productController");
// const { login, register } = require("./controllers/userController");

// mongoose.connect(
//   "mongodb://localhost/auth-service",
//   {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   },
//   () => {
//     console.log(`Auth Sevice DB Connected`);
//   }
// );

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", false);
    // mongoose.connect(process.env.MONGO_URI);
    await mongoose.connect("mongodb://localhost/product-service", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Product Sevice DB Connected`);
  } catch (error) {
    console.log(error);
    process.exit();
  }
};

connectDB();

app.use(express.json());

async function connectAmqp() {
  const amqpServer = "amqp://localhost:5672";
  connection = await amqp.connect(amqpServer);
  channel = await connection.createChannel();
  await channel.assertQueue("PRODUCT");
}

connectAmqp();

app.post("/product/buy", isAuthenticated, async (req, res) => {
  const { ids } = req.body;
  const products = await Product.find({ _id: { $in: ids } });
  channel.sendToQueue(
    "ORDER",
    Buffer.from(
      JSON.stringify({
        products,
        userEmail: req.user.email,
      })
    )
  );
  channel.consume("PRODUCT", (data) => {
    order = JSON.parse(data.content);
  });
  return res.status(200).send({
    success: true,
    message: "order received",
    data: order,
  });
});

app.post("/product/create", isAuthenticated, createProduct);

app.listen(PORT, () => {
  console.log(`Product-Service Runing at ${PORT}`);
});
