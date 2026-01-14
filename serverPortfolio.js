import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import recordRoutes from "./routes/records.js";
import authRoutes from "./routes/auth.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/records", recordRoutes);
app.use("/api/auth", authRoutes);

mongoose.connect(process.env.MONGO_URI_PORTFOLIO)
  .then(() => app.listen(process.env.PORT_PORTFOLIO, () => 
    console.log("Portfolio server running on port 5001")
  ))
  .catch(err => console.error(err));
