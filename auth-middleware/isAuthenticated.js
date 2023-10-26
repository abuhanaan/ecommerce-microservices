const jwt = require("jsonwebtoken");

const isAuthenticated = (req, res, next) => {
  try {
    if (req.headers["authorization"] === undefined) {
      return res.status(401).send({
        success: false,
        message: "A token is required",
      });
    }
    const token = req.headers["authorization"].split(" ")[1];

    jwt.verify(token, "secret", (err, user) => {
      if (err) {
        return res.json({ message: err });
      } else {
        req.user = user;
        next();
      }
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = isAuthenticated;
