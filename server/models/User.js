import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email:     { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    avatarKey: { type: String }, // e.g. "avatars/abc123-...jpg" stored in S3
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
