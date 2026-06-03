import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import employeeRoutes from "./routes/employeeRoutes.js";
dotenv.config();

connectDB();

const app = express();
const Port = process.env.PORT;

app.use(cors());
app.use(express.json()); 
app.use("/HRFlow", employeeRoutes);
app.get('/', (req, res) => {
  res.send('Welcome to the HRFlow backend!');
});

app.listen(Port, () => {
  console.log(`server is running on port ${Port}`);
});