import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cartItems: { type: Object, default: {} },
}, {minimize: false});  // Prevents Mongoose from deleting empty objects so cartItems:{} is always saved

// It checks if the user model already exists, if yes it reuses it, otherwise it creates a new model using the schema.
const User =mongoose.models.user || mongoose.model('user', userSchema)

export default User