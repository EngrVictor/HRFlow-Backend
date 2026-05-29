import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

dotenv.config();
connectDB();

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

app.use("/api/analytics", analyticsRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the HRFlow backend!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});