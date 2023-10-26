const express = require("express");
const app = express();
const PORT = process.env.PORT_ONE || 7070;

const mongoose = require("mongoose");
const { login, register } = require("./controllers/userController");

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
    await mongoose.connect("mongodb://localhost/auth-service", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Auth Sevice DB Connected`);
  } catch (error) {
    console.log(error);
    process.exit();
  }
};

connectDB();

app.use(express.json());

app.post("/auth/login", login);

app.post("/auth/register", register);

app.listen(PORT, () => {
  console.log(`Auth-Service at ${PORT}`);
});
