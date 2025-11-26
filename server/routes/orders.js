import express from "express";
import Order from "../models/Order.js"; // <-- adjust this path if your model is elsewhere

const router = express.Router();

router.post("/orders", async (req, res) => {
  try {
    const { name, email, address, bedding, feed } = req.body || {};

    if (!name || !email || !address) {
      return res
        .status(400)
        .json({ message: "name, email, and address are required" });
    }

    await Order.create({
      name,
      email: email.toLowerCase(),
      address,
      bedding,
      feed,
    });

    res.status(201).json({ message: "New order created successfully!" });
  } catch (err) {
    console.error("[orders] creation error:", err);
    res.status(500).json({ message: "Error creating order." });
  }
});

export default router;
