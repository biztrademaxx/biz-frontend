import mongoose from "mongoose";

const MONGODB_URI = process.env.DATABASE_URL;

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export default async function dbConnect() {
  if (!MONGODB_URI) {
    throw new Error("DATABASE_URL is not set; cannot connect to MongoDB");
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
