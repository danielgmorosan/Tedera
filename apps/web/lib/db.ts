import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Missing MONGO_URI env");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// @ts-expect-error attach to global
let cached: MongooseCache = global._mongooseCache || {
  conn: null,
  promise: null,
};
// @ts-expect-error attach to global
if (!global._mongooseCache) global._mongooseCache = cached;

export async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { dbName: "tedera" })
      .then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
