import express from "express";
import Record from "../models/Record.js";
import Counter from "../models/Counter.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET next sequential code (preview only — does NOT increment)
router.get("/next-code", protect, async (req, res) => {
  try {
    const counter = await Counter.findOne({ name: "record" });
    const nextSeq = counter ? counter.seq + 1 : 1;
    const nextCode = `ACQ-${String(nextSeq).padStart(3, "0")}`;
    res.json({ code: nextCode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get next code" });
  }
});

// GET all records
router.get("/", protect, async (req, res) => {
  try {
    const records = await Record.find().sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch records" });
  }
});

// GET single record
router.get("/:id", protect, async (req, res) => {
  try {
    const record = await Record.findById(req.params.id);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch record" });
  }
});

// POST new record (GENERATES SEQUENTIAL CODE)
router.post("/", protect, async (req, res) => {
  try {
    // Increment the counter ONLY when creating a new record
    const counter = await Counter.findOneAndUpdate(
      { name: "record" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const code = `ACQ-${String(counter.seq).padStart(3, "0")}`;

    // Create formatted timestamp
    const now = new Date();
    const options = { day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" };
    const formattedCreatedAt = now.toLocaleString("en-GB", options).replace(",", " at");

    const record = new Record({
      ...req.body,
      code,
      createdAt: now,
      formattedCreatedAt
    });

    await record.save();
    res.status(201).json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create record" });
  }
});

// PUT update record
router.put("/:id", protect, async (req, res) => {
  try {
    const updated = await Record.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Record not found" });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update record" });
  }
});

// DELETE ALL records
router.delete("/", protect, async (req, res) => {
  try {
    await Record.deleteMany({});
    res.status(200).json({ message: "All records deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete all records" });
  }
});


// DELETE record
router.delete("/:id", protect, async (req, res) => {
  try {
    const deleted = await Record.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Record not found" });
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete record" });
  }
});

export default router;
