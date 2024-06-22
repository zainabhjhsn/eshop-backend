import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "User",
    },
    name: {
      type: String,
      required: [true, "Please enter product name"],
    },
    category : {
      type: String,
      required: [true, "Please enter product category"],
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    rating: {
      type: Number, 
      required: true,
      default: 0,
    },
    desc : {
      type: String,
      required: [true, "Please enter product description"],
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    discount: {
      type: Number,
      required: true,
      default: 0,
    },
    image: {
      type: String,
      // required: [true, "Please enter product image"],
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
