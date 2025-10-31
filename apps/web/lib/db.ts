import mongoose from "mongoose";

// Read env inside the function to avoid failing at import/build time

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
  const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://asr3012003:DJDWHrDKDt1uEK4m@siddxcluster.2ffjy.mongodb.net/tedera?retryWrites=true&w=majority&appName=SiddxCluster"
  console.log("MONGODB_URI", MONGODB_URI);
  if (!MONGODB_URI) {
    throw new Error("Missing MONGODB_URI env");
  }
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { dbName: "tedera" })
      .then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
