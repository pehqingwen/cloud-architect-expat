import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/auth.js";
import ordersRouter from "./routes/orders.js";
import { S3Client, ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";
import Order from "./models/Order.js";
import User from "./models/User.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // Parse JSON from frontend 
app.use(express.urlencoded({ extended: true }));

// MongoDB connection 
const encodedPass = encodeURIComponent(process.env.MONGO_PASS);
const uri = `mongodb+srv://pehqingwen:SqueakyFluffy01@cluster0.cawhvhn.mongodb.net/myOrders?retryWrites=true&w=majority`;

mongoose.connect(uri)
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));


const allowed = [
    "http://localhost:5173",
    process.env.FRONTEND_ORIGIN, // e.g., https://your-frontend.vercel.app
].filter(Boolean);


const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:8080";
const corsOptions = {
    origin: FRONTEND_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

app.use(cors(corsOptions));
app.use("/api", ordersRouter);

app.use(
    cors({
        origin: (origin, cb) => {
            // allow tools like curl/postman (no origin)
            if (!origin) return cb(null, true);
            cb(null, allowed.includes(origin));
        },
        credentials: true,
    })
);

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

// mount feature routes
app.use("/api/auth", authRouter);

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
        const bucket = process.env.S3_BUCKET;
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

app.get("/health", (_req, res) => res.status(200).send("ok"));
app.listen(PORT, "0.0.0.0", () => console.log(`API on ${PORT}`));

app.get("/api/healthz", (_req, res) => res.status(200).send("ok"));

// Example route
app.get("/api/hello", (_, res) => res.json({ msg: "hi" }));

app.get("/", (req, res) => res.send("Backend is running!"));

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));
