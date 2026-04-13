// models/Otp.ts
import mongoose, { Schema, model, models } from "mongoose";

const OtpSchema = new Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

export default models.Otp || model("Otp", OtpSchema);
