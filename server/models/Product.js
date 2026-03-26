import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: Array, required: true, },
  price: { type: Number, required: true },
  offerPrice: { type: Number, default: true },
   //type: Array becasue we"ll have multiple images 
  image: { type: Array, required: true },
  category: { type: String, required: true },
  inStock: { type: Boolean, default: true }, //Boolean: because stock can either be true or false
}, {timestamps: true});  //whenever the new product will be added we will get to know the date and time

// It checks if the user model already exists, if yes it reuses it, otherwise it creates a new model using the schema.
const Product = mongoose.models.product || mongoose.model('product', productSchema)

export default Product