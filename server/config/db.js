import mongoose from "mongoose";

const connectDB = async () => {
    try {
        
        mongoose.connection.on('connected', () => console.log("Database Connected"))
        //it will create database in mongodb with the name greencart
        await mongoose.connect(`${process.env.MONGODB_URI}/greencart`)
    } catch (error) {
        console.error(error.message);
    }
}

export default connectDB;