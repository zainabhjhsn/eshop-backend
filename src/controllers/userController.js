import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import fs from "fs";
import path from "path";
import Product from "../models/productModel.js";

//Register a new user
// /api/users
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

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
    role,
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
export const getInfo = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate([
      {
        path: "cart",
        populate: {
          path: "items",
          populate: {
            path: "productId",
            model: "Product",
          },
        },
      },
      {
        path: "favorites",
        model: "Product",
        select: "-rating",
      },
    ])
    .select("-password");

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

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password");
  return res.json(users);
});

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

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    const { name, email, role, oldPassword, newPassword } = req.body;
    const imagePath = `src/uploads/users/${user.avatar}`;
    if (req.file) {
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
      user.avatar = req.file?.filename;
    }

    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        res.status(400);
        throw new Error("Invalid password");
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    await user.save();
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { name, email, role, oldPassword, newPassword } = req.body;
    const imagePath = `src/uploads/users/${user.avatar}`;
    if (req.file) {
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
      user.avatar = req.file?.filename;
    }

    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        res.status(400);
        throw new Error("Invalid password");
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    await user.save();
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export const updateProfile = asyncHandler(async (req, res) => {
  // the id is in req.user._id because we are using the protect middleware
  const user = await User.findById(req.user._id);
  const { name, oldPassword, newPassword } = req.body;

  if (user) {
    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        res.status(400);
        throw new Error("Invalid password");
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }
    // console.log(oldPassword, user.password);

    //here we are updating the user
    if (name) user.name = name;
    await user.save();
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    const imagePath = `src/uploads/users/${user.avatar}`;
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });
    await User.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});
