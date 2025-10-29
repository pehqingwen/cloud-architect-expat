import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // Parse JSON from frontend

// MongoDB connection
const encodedPass = encodeURIComponent(process.env.MONGO_PASS);
const uri = `mongodb+srv://pehqingwen:SqueakyFluffy01@cluster0.cawhvhn.mongodb.net/myOrders?retryWrites=true&w=majority`;

mongoose.connect(uri)
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

// Define Schema and Model
const orderSchema = new mongoose.Schema({
    name: String,
    email: String,
    address: String,
    bedding: Number,
    feed: Number,
});

const Order = mongoose.model("Order", orderSchema);

// POST route for form submission
app.post("/api/order", async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).json({ message: "Order saved successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error saving order." });
    }
});

app.get("/", (req, res) => res.send("Backend is running!"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
