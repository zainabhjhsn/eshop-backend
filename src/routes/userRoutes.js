import express from "express";
import { getMe, loginUser, registerUser } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";
import multer from "multer";

const storage = multer.diskStorage({
    destination: "src/uploads/users",
    filename: function (req, file, cb) {
      cb(null, new Date().getTime() + file.originalname); //because of same name issue we are adding date
    },
  });
  const upload = multer({ storage: storage });

const router = express.Router();


//Register a new user
router.post("/", upload.single("avatar"), registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);


export default router;