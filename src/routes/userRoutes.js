import express from "express";
import { deleteUser, getInfo, getUsers, loginUser, registerUser, updateAvatar, updateProfile, updateUser } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";
import multer from "multer";
import { adminProtect } from "../middlewares/adminAuth.js";

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
router.put("/:id", adminProtect, upload.single("avatar"), updateUser)
router.delete("/:id", adminProtect, deleteUser);



export default router;