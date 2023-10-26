const User = require("../models/User");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  const { email, password, name } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res
      .status(409)
      .send({ success: false, message: "User already exists" });
  } else {
    const newUser = new User({
      email,
      name,
      password,
    });
    newUser.save();
    return res.status(200).send({
      success: true,
      message: `User Created Succesfully`,
      data: newUser,
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res
      .status(404)
      .send({ success: false, message: "User doesn't exist" });
  } else {
    if (password !== user.password) {
      return res
        .status(400)
        .send({ success: false, message: "Password Incorrect" });
    }
    const payload = {
      email,
      name: user.name,
    };
    jwt.sign(payload, "secret", (err, token) => {
      if (err) console.log(err);
      else
        return res.status(200).json({
          success: true,
          message: "User Logged-in succesfully",
          token: token,
        });
    });
  }
};

const userControllers = {
  register,
  login,
};

module.exports = userControllers;
