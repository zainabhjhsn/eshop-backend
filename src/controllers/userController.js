import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import fs from "fs";
import path from "path";

//Register a new user
// /api/users
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please fill in all fields");
  }
  //check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  //hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  //create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    avatar: req.file.filename,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

//Authenticate a user
// /api/users/login
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  //check for user email
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid credentials");
  }
});

//Get user data
// /api/users/me
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  // const { _id, name, email } = await User.findById(req.user._id);

  // res.status(200).json({
  //   _id,
  //   name,
  //   email,
  // });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json(user);
});

//Generate jwt token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const updateAvatar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const imagePath = `src/uploads/users/${user.avatar}`;
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });
    user.avatar = req.file.filename;
    await user.save();
    res.json(user.avatar);
  } else {
    res.status(404);
    throw new Error("User not found");
  }

  res.json("Avatar updated");
});
