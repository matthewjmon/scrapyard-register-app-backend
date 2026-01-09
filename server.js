import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import recordRoutes from "./routes/records.js";
import authRoutes from "./routes/auth.js"; // <--- import auth routes

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Mount routes
app.use("/api/records", recordRoutes);
app.use("/api/auth", authRoutes); // <--- mount auth routes

mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(process.env.PORT, () =>
    console.log(`Server running on port ${process.env.PORT}`)
  ))
  .catch(err => console.error(err));
