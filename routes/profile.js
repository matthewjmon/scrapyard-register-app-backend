import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js"; // middleware to get user from token

const router = express.Router();

// Update business name
router.put("/business-name", protect, async (req, res) => {
  try {
    const { businessName } = req.body;

    if (!businessName || businessName.trim() === "") {
      return res.status(400).json({ message: "Business name cannot be empty" });
    }

    // req.user is populated by authMiddleware from JWT
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.businessName = businessName.trim();
    await user.save();

    res.json({ businessName: user.businessName });
  } catch (err) {
    console.error("UPDATE BUSINESS NAME ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
