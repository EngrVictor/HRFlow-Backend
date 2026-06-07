import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import leaveRoutes from './routes/leave-request.js';
import recruitmentRoutes from './routes/recruitmentRoutes.js';
import performanceRoutes from './routes/performanceRoutes.js';

dotenv.config();
connectDB();

const app = express();
const port = process.env.PORT;
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/leave-requests', leaveRoutes);
app.use('/api/recruitment', recruitmentRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "HRFlow Africa Backend Engine is operating completely functional.",
  });
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
