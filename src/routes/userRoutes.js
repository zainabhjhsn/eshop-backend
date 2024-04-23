import express from "express";
import { getMe, loginUser, registerUser, updateAvatar, updateProfile } from "../controllers/userController.js";
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
router.put("/updateAvatar", protect, upload.single("avatar"), updateAvatar);
router.put("/updateProfile", protect, updateProfile);


export default router;