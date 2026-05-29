import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();
// connectDB();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the HRFlow backend!");
});

import notificationRoutes from "./routes/notificationRoutes.js";

app.use("/api/notifications", notificationRoutes);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
