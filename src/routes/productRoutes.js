import express from "express";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "../controllers/productController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { adminProtect } from "../middlewares/adminAuth.js";
import { userProtect } from "../middlewares/userAuth.js";

const router = express.Router();

router
  .route("/:id")
  .get(protect, userProtect, getProductById)
  .put(protect, adminProtect, updateProduct)
  .delete(protect, adminProtect, deleteProduct);
router
  .route("/")
  .get(protect, userProtect, getProducts)
  .post(protect, adminProtect, createProduct);

export default router;
