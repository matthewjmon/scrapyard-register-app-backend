import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js"; // make sure this path is correct

const router = express.Router();

// Generate JWT
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in .env");
  }
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// ===== LOGIN ROUTE =====
router.post("/login", async (req, res) => {
  console.log("LOGIN REQUEST BODY:", req.body);
  const { email, password } = req.body;

  try {
    // Find the user in the DB
    const user = await User.findOne({ email });
    console.log("DB USER FOUND:", user);
    if (!user) return res.status(401).json({ message: "Invalid email" });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("PASSWORD MATCH:", isMatch);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    // Return user info + token
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      businessName: user.businessName,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
