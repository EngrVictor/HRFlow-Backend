import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import router from "./routes/notificationRoutes.js";

dotenv.config();
connectDB();

const app = express();
const Port = process.env.PORT;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the HRFlow backend!");
});

app.get("/health", (req, res) => {
  res.status(200).json({
    message: "HRFlow Africa Backend Engine is operating completely functional.",
  });
});

app.use("/api/notifications", router);

app.listen(port, () => {
  console.log("Server successfully deployed on: http://localhost: " + port);
});
