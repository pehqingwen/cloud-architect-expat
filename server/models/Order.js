import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, lowercase: true },
        address: { type: String, required: true },
        bedding: { type: Number, default: 0 },
        feed: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export default mongoose.model("Order", OrderSchema);
