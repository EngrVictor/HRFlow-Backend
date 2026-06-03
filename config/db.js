import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.LIVE_URL );
        console.log("MongoDB connected successfully");
        
    } catch (error) {
        console.error("Database connection Failed: ", error);
    }
}

export default connectDB;