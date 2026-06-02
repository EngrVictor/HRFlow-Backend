import dotenv from "dotenv/config";
import express from "express"
import cors from "cors"


import recruitment from './routes/routes_recruitment.js';

import connectDB from "./config/db.js"
import mongoose from 'mongoose'
import { updateRecruitment } from "./controllers/recruitmentController.js";
connectDB()



const app = express();
const port = process.env.PORT || 3000
app.use(cors());
app.use(express.json());

app.use('/api/recruitment', recruitment); 

app.get('/', (req, res) => {
  res.send('Welcome to the HRFlow backend!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});