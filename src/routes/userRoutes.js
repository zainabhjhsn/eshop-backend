import express from "express";
import multer from "multer";
import {
  deleteUser,
  getInfo,
  getUsers,
  loginUser,
  registerUser,
  updateMyProfile,
  updateUser,
} from "../controllers/userController.js";
import { adminProtect } from "../middlewares/adminAuth.js";
import { protect } from "../middlewares/authMiddleware.js";

const storage = multer.diskStorage({
  destination: "src/uploads/users",
  filename: function (req, file, cb) {
    cb(null, new Date().getTime() + file.originalname); //because of same name issue we are adding date
  },
});
const upload = multer({ storage: storage });

const router = express.Router();

router.post("/", upload.single("avatar"), registerUser);
router.post("/login", loginUser);
router.get("/info", protect, getInfo);
router.get("/", getUsers);
router.put(
  "/update-profile",
  protect,
  upload.single("avatar"),
  updateMyProfile
);
router.put("/:id", adminProtect, upload.single("avatar"), updateUser);

router.delete("/:id", adminProtect, deleteUser);

export default router;
