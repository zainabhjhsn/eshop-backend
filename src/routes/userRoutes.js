import express from "express";
import { deleteUser, getMe, getUsers, loginUser, registerUser, updateAvatar, updateProfile, updateUser } from "../controllers/userController.js";
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

//Register a new user
router.post("/", upload.single("avatar"), registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.get("/", getUsers);
// router.put("/updateAvatar", protect, upload.single("avatar"), updateAvatar);
// router.put("/updateProfile", protect, updateProfile);
router.put("/:id", adminProtect, upload.single("avatar"), updateUser)
router.delete("/:id", adminProtect, deleteUser);


export default router;