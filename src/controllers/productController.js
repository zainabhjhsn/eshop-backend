import Product from "../models/productModel.js";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import fs from "fs";
import path from "path";

export const getProducts = asyncHandler(async (req, res) => {
  let { search, category, price } = req.query; //..products?search=apple
  if (!search) {
    search = "";
  }

  const products = await Product.find({
    name: {
      $regex: search,
      $options: "i", //case insensitive
    },
    // category: category,
    // ...category,
    ...(category && { category: category }),
    ...(price && { price: { $lte: price } }),
    ...(price && { price: { $gte: price } }),
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
    // user: req.user.id,
    name: req.body.name,
    category: req.body.category,
    price: req.body.price,
    rating: req.body.rating,
    desc: req.body.desc,
    quantity: req.body.quantity,
    image: req.file.filename,
  });

  return res.status(200).json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  /*
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
  */

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

  /*
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
*/

  //delete image also from uploads folder
  const image = product.image;
  // const imagePath = path.join(__dirname, `../uploads/products/${image}`);
  const imagePath = `src/uploads/products/${image}`;
  fs.unlink(imagePath, (err) => {
    if (err) {
      console.error(err);
      return;
    }
  });
  await Product.findByIdAndDelete(req.params.id);
  //   await product.remove();

  return res.status(200).json(
    // {message: "Product removed"}
    { id: req.params.id }
  );
});

export const deleteAllProducts = asyncHandler(async (req, res) => {
  //remove all images
  const products = await Product.find({});
  products.forEach((product) => {
    const image = product.image;
    const imagePath = `src/uploads/products/${image}`;
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });
  });
  await Product.deleteMany({});
  return res.status(200).json({ message: "All products removed" });
});
