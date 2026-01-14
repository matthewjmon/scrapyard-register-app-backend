import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const router = express.Router();

const SINGLE_USER = {
  _id: "64f3a1d2b5c9c123456789ab",
  username: "Anton(Manager)",
  email: "asisscrapmetal@gmail.com",
  passwordHash: "$2b$10$1CdgZV5BmLsHjjmNeexojesax7a7st2aDzN1Za0InCH3yvvDScz5K", // make sure this is EXACT hash of "ScrapManager42!"
  businessName: "Asis"
};

const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in .env");
  }
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("LOGIN ATTEMPT:", { email, password }); // <--- DEBUG

  try {
    if (email !== SINGLE_USER.email) {
      console.log("Email mismatch");
      return res.status(401).json({ message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, SINGLE_USER.passwordHash);
    console.log("Password match result:", isMatch); // <--- DEBUG
    if (!isMatch) {
      console.log("Password mismatch");
      return res.status(401).json({ message: "Invalid password" });
    }

    console.log("Login successful");
    res.json({
      _id: SINGLE_USER._id,
      username: SINGLE_USER.username,
      email: SINGLE_USER.email,
      businessName: SINGLE_USER.businessName,
      token: generateToken(SINGLE_USER._id)
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;
