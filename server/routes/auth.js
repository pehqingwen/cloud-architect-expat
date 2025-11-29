import express from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/User.js";
import Order from "../models/Order.js";
import { S3Client } from "@aws-sdk/client-s3";
import { Router } from "express";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

const router = express.Router();

/**
 * Client flow (recommended):
 * 1) Upload image to S3 with a presigned POST → you get `key`
 * 2) Call this endpoint with { email, password, avatarKey: key }
 */

// S3 client reads region & creds from env
const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

/**
 * Get a presigned POST so the browser can upload the avatar directly to S3.
 * Body: { email, fileName, contentType }
 * Returns: { url, fields, key }
 */

router.post("/avatar/presign", async (req, res) => {
    try {
        const { email, fileName, contentType } = req.body;
        if (!email || !fileName || !contentType) {
            return res.status(400).json({ message: "email, fileName, contentType are required" });
        }

        // Allowlist — add/remove types you want to accept
        const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
        if (!ALLOWED.includes(contentType)) {
            return res.status(415).send("Unsupported image type");
        }

        // Generate a safe, unique key under avatars/
        const ext = (fileName.split(".").pop() || "jpg").toLowerCase();
        const emailHash = crypto.createHash("sha256").update(String(email).toLowerCase()).digest("hex").slice(0, 12);
        const key = `avatars/${encodeURIComponent(email)}/${Date.now()}-${fileName}`;

        // Create a short-lived presigned POST with constraints
        const presignedPost = await createPresignedPost(s3, {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key,
            // Fields: {
            //     key,
            //     "Content-Type": contentType,
            // },
            Conditions: [
                ['content-length-range', 0, 10_000_000],       // up to ~10MB
                ['starts-with', '$Content-Type', ''],          // allow any content type
            ],
            Expires: 60, // seconds
        });

        return res.json({
            url: presignedPost.url,
            fields: presignedPost.fields,
            key,
        });
    } catch (err) {
        console.error('Error in /api/auth/avatar/presign:', err);
        return res.status(500).json({ message: "Failed to create presigned post" });
    }
});

/**
 * Signup (after upload succeeds)
 * Body: { email, password, avatarKey? }
 */
router.post("/signup", async (req, res) => {
    try {
        const { email, password, avatarKey } = req.body || {};
        if (!email || !password) {
            return res.status(400).json({ message: "email & password required" });
        }

        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) return res.status(409).json({ message: "Email already registered" });

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await User.create({
            email: email.toLowerCase(),
            passwordHash,
            avatarKey: avatarKey || undefined,
        });

        res.status(201).json({ message: "User created successfully!", userId: user._id });
    } catch (err) {
        console.error("[signup] error:", err);
        res.status(500).json({ message: "Error creating membership." });
    }
});

export default router;
