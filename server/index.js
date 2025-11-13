import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js"; // one router only

const app = express();
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:8080";

app.use((req, res, next) => { console.log(req.method, req.path); next(); });

const corsOptions = {
  origin: FRONTEND_ORIGIN,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
// app.options("(.*)", cors({ origin: FRONTEND_ORIGIN, credentials: true }));

app.use(express.json());

// Health (under /api to match your proxy tests)
app.get("/api/healthz", (_req, res) => res.status(200).send("ok"));

// Mount your API routes under /api
app.use("/api", authRouter);

const envPort = process.env.PORT;
const PORT = (envPort && Number(envPort)) || 3000;
app.listen(PORT, "0.0.0.0", () => console.log(`API on ${PORT}`)); 
