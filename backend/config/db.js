const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Force rebuild all indexes (fixes geospatial search issues)
    await conn.connection
      .collection("users")
      .dropIndexes()
      .catch(() => {});
    await conn.syncIndexes();
    console.log("✅ Indexes rebuilt successfully");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
