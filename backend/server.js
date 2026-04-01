const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isDefaultAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  try {
    const parsedOrigin = new URL(origin);
    const hostname = parsedOrigin.hostname;

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return true;
    }

    if (hostname.endsWith(".vercel.app")) {
      return true;
    }
  } catch (_error) {
    return false;
  }

  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser clients, configured origins, localhost, and Vercel domains.
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      isDefaultAllowedOrigin(origin)
    ) {
      callback(null, true);
      return;
    }

    callback(new Error("Origin not allowed by CORS"));
  },
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// DB Connection
connectDB();

// Routes
app.use("/api/users", userRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
