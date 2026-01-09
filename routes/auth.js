import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "../models/User.js";

const router = express.Router();

// Helper: generate JWT
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in .env");
  }
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = { id: decoded.id };
    next();
  });
};

// REGISTER
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ username, email, password });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      businessName: user.businessName || "",
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// CHECK if any users exist
router.get("/exists", async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    res.json({ exists: userCount > 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to check users" });
  }
});

// FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    // Always return success message (prevents email enumeration)
    if (!user) {
      return res.json({
        message: "If an account with that email exists, a reset link has been sent.",
      });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 587,
      secure: false,
      auth: {
        user: "apikey",
        pass: process.env.SENDGRID_PASSWORD, // SendGrid API Key
      },
    });

    const message = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Password Reset",
      text: `You requested a password reset.\n\nReset your password here:\n${resetUrl}\n\nIf you did not request this, ignore this email.`,
    };

    await transporter.sendMail(message);

    res.json({
      message: "If an account with that email exists, a reset link has been sent.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending reset email" });
  }
});

// RESET PASSWORD
router.post("/reset-password/:token", async (req, res) => {
  const { password } = req.body;

  if (!password || password.length < 8) {
    return res
      .status(400)
      .json({ message: "Password must be at least 8 characters long" });
  }

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE PROFILE
router.patch("/update-profile", authenticateToken, async (req, res) => {
  try {
    const { username, email, businessName } = req.body;

    const updates = {};
    if (username) updates.username = username;
    if (email) updates.email = email;
    if (businessName) updates.businessName = businessName;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    });

    res.json({
      username: updatedUser.username,
      email: updatedUser.email,
      businessName: updatedUser.businessName || "",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

export default router;
