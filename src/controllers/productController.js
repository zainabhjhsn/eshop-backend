import Product from "../models/productModel.js";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";

export const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({
    //relate the product to the user who created it
    user: req.user.id,
  });
  return res.status(200).send(products);
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).send({
      message: "Product not found",
    });
  }
  return res.status(200).json(product);
});

export const createProduct = asyncHandler(async (req, res) => {
  if (!req.body.name) {
    return res.status(400).send({
      message: "Product name can not be empty",
    });
  }

  //   await Product.create(req.body);
  const product = await Product.create({
    name: req.body.name,
    price: req.body.price,
    user: req.user.id,
  });

  return res.status(200).json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const user = await User.findById(req.user.id);

  if(!user) { 
    res.status(401);
    throw new Error("User not found");
  }

  //Make sure the logged in user is the owner of the product/ matches the product user
  if(product.user.toString() !== user.id) {
    res.status(401);
    throw new Error("User is not authorized to update this product");
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      // runValidators: true
    }
  );

  return res.status(200).json(updatedProduct);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const user = await User.findById(req.user.id);

  if(!user) { 
    res.status(401);
    throw new Error("User not found");
  }

  //Make sure the logged in user is the owner of the product/ matches the product user
  if(product.user.toString() !== user.id) {
    res.status(401);
    throw new Error("User is not authorized to delete this product");
  }

  await Product.findByIdAndDelete(req.params.id);
  //   await product.remove();

  return res.status(200).json(
    // {message: "Product removed"}
    { id: req.params.id }
  );
});
