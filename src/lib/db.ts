import mongoose from "mongoose";

async function dbConnect() {
  // check if we are already connected to the database
  if (mongoose.connection.readyState >= 1) return;

  // otherwise, create a new connection
  return mongoose.connect(process.env.DATABASE_URL || "");
}

export default dbConnect;
