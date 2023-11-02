const express = require("express");
const app = express();
const PORT = process.env.PORT_ONE || 7072;

const isAuthenticated = require("../../auth-middleware/isAuthenticated");

const amqp = require("amqplib");
var channel, connection;
const mongoose = require("mongoose");
const Order = require("./models/Order");
// const { createProduct } = require("./controllers/productController");

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
    await mongoose.connect("mongodb://localhost/order-service", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Order Sevice DB Connected`);
  } catch (error) {
    console.log(error);
    process.exit();
  }
};

connectDB();

app.use(express.json());

const createOrder = (products, userEmail) => {
  let total = 0;
  for (let t = 0; t < products.length; ++t) {
    total += products[t].price;
  }
  const newOrder = new Order({
    products,
    user: userEmail,
    total_price: total,
  });
  newOrder.save();
  return newOrder;
};

async function connectAmqp() {
  const amqpServer = "amqp://localhost:5672";
  connection = await amqp.connect(amqpServer);
  channel = await connection.createChannel();
  await channel.assertQueue("ORDER");
}

connectAmqp().then(() => {
  // order service listens to data payloads from Product with the name ORDER
  channel.consume("ORDER", (data) => {
    console.log("Consuming ORDER Queue From the Product Service");
    const { userEmail, products } = JSON.parse(data.content);
    const newOrder = createOrder(products, userEmail);
    // acknowledging payload from product service and removing it from the queue
    channel.ack(data);
    // sending response back to the product service
    channel.sendToQueue("PRODUCT", Buffer.from(JSON.stringify({ newOrder })));
    console.log(newOrder);
  });
});

app.listen(PORT, () => {
  console.log(`Order-Service Runing at ${PORT}`);
});
