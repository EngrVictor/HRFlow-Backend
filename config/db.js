import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.LIVE_URL );
        console.log("MongoDB connected successfully");
        
    } catch (error) {
        console.error("Database connection Failed: ", error);
    }
}

        const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL;
        if (!mongoUri) {
            throw new Error("Missing MongoDB URI. Set MONGODB_URI or MONGODB_URL in your environment.");
        }
        await mongoose.connect(mongoUri);
        console.log("MongoDB connected successfully")*/
