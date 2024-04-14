import express from "express";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
  deleteAllProducts,
} from "../controllers/productController.js";
import { adminProtect } from "../middlewares/adminAuth.js";
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
  .put(adminProtect, updateProduct)
  .delete(adminProtect, deleteProduct);
router
  .route("/")
  .get(getProducts)
  .post(adminProtect, upload.single("image"), createProduct);
router
.route("/delete/all")
.delete(adminProtect, deleteAllProducts);


export default router;
