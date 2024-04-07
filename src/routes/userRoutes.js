import express from "express";
import { getMe, loginUser, registerUser } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();


//Register a new user
router.post("/", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);


export default router;