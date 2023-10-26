const Product = require("../models/Product");

const buyProduct = async (req, res, channel) => {
  try {
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
      message: `Order Created Successfully`,
      data: order,
    });
  } catch (error) {
    console.log(error);
  }
};

const createProduct = async (req, res) => {
  const { name, description, price } = req.body;
  const newProduct = new Product({
    name,
    description,
    price,
  });
  newProduct.save();
  return res.status(201).send({
    success: true,
    message: `New Product Added Successfully`,
    data: newProduct,
  });
};

const productControllers = {
  buyProduct,
  createProduct,
};

module.exports = productControllers;
