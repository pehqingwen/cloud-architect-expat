import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/auth.js";
import ordersRouter from "./routes/orders.js";
import { S3Client, ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";
import Order from "./models/Order.js";
import User from "./models/User.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

const allowedOrigins = [
    'http://a82930ec009464c38b192c011d45e901-1704323071.us-east-1.elb.amazonaws.com', // frontend LB
    'http://localhost:5173', // optional, for local dev
];

const corsOptions = {
    origin: allowedOrigins,
    credentials: true,
}; 

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// auth routes
app.use("/api/auth", authRouter);

// orders routes
app.use("/api", ordersRouter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB connection 
const uri = process.env.MONGODB_URI;
mongoose.connect(uri)
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:8080";

app.use(cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(cors({
    origin: function (origin, callback) {
        // allow REST tools or same-origin with no origin header
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));

app.use((err, req, res, next) => {
    console.error(err);
    const status =
        err.name === "ValidationError" ? 400 :
            err.name === "MongoServerError" ? 500 :
                500;
    res.status(status).json({ error: err.message });
});

const s3 = new S3Client({
    region: process.env.AWS_REGION,
});

// POST route for form submission
app.post("/api/orders", async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).json({ message: "Order saved successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error saving order." });
    }
});

app.get("/db/ping", async (req, res) => {
    try {
        await mongoose.connection.db.admin().ping();
        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ ok: false, error: e.message });
    }
});

app.get("/s3/ping", async (req, res) => {
    try {
        const bucket = process.env.AWS_S3_BUCKET;
        // 1) write a tiny test object (optional but proves PutObject)
        const key = `healthchecks/${Date.now()}.txt`;
        await s3.send(new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: "ok",
            ContentType: "text/plain"
        }));

        // 2) list a few objects (proves ListBucket permissions)
        const out = await s3.send(new ListObjectsV2Command({
            Bucket: bucket,
            MaxKeys: 5
        }));

        res.json({
            ok: true,
            wrote: key,
            listed: (out.Contents || []).map(o => o.Key)
        });
    } catch (e) {
        console.error("S3 ping error:", e);
        res.status(500).json({ ok: false, error: e.message });
    }
});


const envPort = process.env.PORT;
const PORT = (envPort && Number(envPort)) || 3000;
if (!Number.isFinite(PORT) || PORT <= 0) {
    throw new Error(`Invalid PORT: ${envPort}`);
}

// Serve static files from the built client
app.use(express.static(path.join(__dirname, "public")));

// SPA fallback: send index.html for any non-API route
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/health", (_req, res) => res.status(200).send("ok"));
app.listen(PORT, "0.0.0.0", () => console.log(`API on ${PORT}`));

app.get("/api/healthz", (_req, res) => res.status(200).send("ok"));

// Example route
app.get("/api/hello", (_, res) => res.json({ msg: "hi" }));

app.get("/", (req, res) => res.send("Backend is running!"));

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));
