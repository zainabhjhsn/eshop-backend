import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";

const userProtect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      //Get token from header
      token = req.headers.authorization.split(" ")[1];
      //Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      //Get user from token, it won't include the password
      req.user = await User.findById(decoded.id).select("-password");

      if (req.user.role == "user" || req.user.role == "admin") {
        next();
      } else {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});
export { userProtect };
