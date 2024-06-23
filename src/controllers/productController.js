import Product from "../models/productModel.js";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import fs from "fs";
import path from "path";

export const getProducts = asyncHandler(async (req, res) => {
  let { search, category, price, page, limit } = req.query; //..products?category=Accessories&price=0-500
  if (!page) {
    page = 0;
  }
  if (!limit) {
    limit = 10;
  }
  if (!search) {
    search = "";
  }

  const minPrice = price ? price.split("-")[0] : 0;
  const maxPrice = price ? price.split("-")[1] : 0;
  const count = await Product.countDocuments();

  const products = await Product.find({
    name: {
      $regex: search,
      $options: "i", //case insensitive
    },
    // category: category,
    // ...category,
    ...(category && { category: category }), //if category exists, then add category to the query object, this is a dynamic way of adding properties to an object
    // ...(price && { price: { $lte: price } }),
    // ...(price && { price: { $gte: price } }),
    // ...(price && { price: price }),
    ...(price && { price: { $lte: maxPrice, $gte: minPrice } }),
  })
    .skip(parseInt(page) * parseInt(limit)) //limit=2 page=1, skip 2 =>
    .limit(parseInt(limit))
    .sort({ createdAt: -1 }); //sort by latest
  return res.status(200).send({ products, count });
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
    image: req.file ? req.file.filename : null,
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
    {
      ...req.body,
      image: req.file ? req.file.filename : product.image,
    },
    {
      new: true,
      // runValidators: true
    }
  );

  //delete image if new image is uploaded
  if (req.file) {
    const image = product.image;
    // const imagePath = path.join(__dirname, `../uploads/products/${image}`);
    const imagePath = `src/uploads/products/${image}`;
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });
  }

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


//Cart
export const addToCart = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  const quantity = req.body.quantity;
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  //check if user is logged in
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }

  const item = {
    productId: product._id,
    quantity: quantity || 1,
  };

  //check if product is already in cart
  const productInCart = user.cart.items.find(
    (item) => item.productId.toString() === req.params.id
  );

  if (productInCart) {
    productInCart.quantity += quantity || 1;
  } else {
    user.cart.items.push(item);
  }

  await user.save();
  return res.status(200).json(user.cart);

});

export const removeFromCart = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  //check if user is logged in
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }

  const productInCart = user.cart.items.find(
    (item) => item.productId.toString() === req.params.id
  );

  if (productInCart) {
    user.cart.items = user.cart.items.filter(
      (item) => item.productId.toString() !== req.params.id
    );
  }

  await user.save();
  return res.status(200).json(user.cart);
});

export const addToFavorites = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  //check if user is logged in
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }

  const productInFav = user.favorites.find(
    (item) => item.toString() === req.params.id
  );

  if (!productInFav) {
    user.favorites.push(req.params.id);
  }

  await user.save();
  return res.status(200).json(user.favorites);
});

export const removeFromFavorites = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  //check if user is logged in
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }

  user.favorites = user.favorites.filter(
    (item) => item.toString() !== req.params.id
  );

  await user.save();
  return res.status(200).json(user.favorites);
});