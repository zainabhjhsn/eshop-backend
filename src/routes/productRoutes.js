import express from "express";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
  deleteAllProducts,
  addToCart,
} from "../controllers/productController.js";
import { adminProtect } from "../middlewares/adminAuth.js";
import { userProtect } from "../middlewares/userAuth.js";
import multer from "multer";

const storage = multer.diskStorage({
  destination: "src/uploads/products",
  filename: function (req, file, cb) {
    cb(null, new Date().getTime() + file.originalname); //because of same name issue we are adding date
  },
});
const upload = multer({ storage: storage });
const router = express.Router();

router
  .route("/:id")
  .get(getProductById)
  .put(adminProtect, upload.single("image"), updateProduct)
  .delete(adminProtect, deleteProduct);
router
  .route("/")
  .get(getProducts)
  .post(adminProtect, upload.single("image"), createProduct);
router.route("/cart/:id").post(userProtect, addToCart);
router.route("/delete/all").delete(adminProtect, deleteAllProducts);

export default router;
