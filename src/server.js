import express from "express";
import dotenv from "dotenv";
import productRouter from "./routes/productRoutes.js";
import errorHandler from "./middlewares/errorMiddleware.js";
import connectDB from "./config/db.js";
import userRouter from "./routes/userRoutes.js";
import cors from "cors";
import morgan from "morgan";

dotenv.config();

connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(morgan("dev"));

import Product from "./models/productModel.js";
import User from "./models/userModel.js";

app.use("/api/products", productRouter);
app.use("/api/users", userRouter);

app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log("Server is running on port 3001");
});