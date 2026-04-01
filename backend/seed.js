const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const User = require("./models/User");

const DUMMY_DONORS = [
  // Hyderabad
  {
    name: "Kiran Reddy",
    bloodGroup: "O+",
    contact: "9876543210",
    location: { type: "Point", coordinates: [78.3478, 17.4213] },
  },
  {
    name: "Sowmya Rao",
    bloodGroup: "A+",
    contact: "8765432109",
    location: { type: "Point", coordinates: [78.35, 17.42] },
  },
  {
    name: "Naveen Goud",
    bloodGroup: "B+",
    contact: "7654321098",
    location: { type: "Point", coordinates: [78.35, 17.41] },
  },
  {
    name: "Divya Rani",
    bloodGroup: "B-",
    contact: "9123456789",
    location: { type: "Point", coordinates: [78.36, 17.43] },
  },
  {
    name: "Rahul Teja",
    bloodGroup: "AB+",
    contact: "9234567890",
    location: { type: "Point", coordinates: [78.32, 17.42] },
  },

  // Mumbai
  {
    name: "Aarav Mehta",
    bloodGroup: "O+",
    contact: "9345678901",
    location: { type: "Point", coordinates: [72.8776, 19.0759] },
  },
  {
    name: "Ishita Shah",
    bloodGroup: "A+",
    contact: "9456789012",
    location: { type: "Point", coordinates: [72.88, 19.08] },
  },
  {
    name: "Yash Kulkarni",
    bloodGroup: "B+",
    contact: "9567890123",
    location: { type: "Point", coordinates: [72.87, 19.07] },
  },
  {
    name: "Riya Deshmukh",
    bloodGroup: "O-",
    contact: "9678901234",
    location: { type: "Point", coordinates: [72.89, 19.09] },
  },

  // Delhi
  {
    name: "Kabir Malhotra",
    bloodGroup: "A+",
    contact: "9789012345",
    location: { type: "Point", coordinates: [77.1025, 28.7041] },
  },
  {
    name: "Aditi Bansal",
    bloodGroup: "B+",
    contact: "9890123456",
    location: { type: "Point", coordinates: [77.11, 28.71] },
  },
  {
    name: "Raghav Tandon",
    bloodGroup: "AB-",
    contact: "9901234567",
    location: { type: "Point", coordinates: [77.1, 28.7] },
  },
  {
    name: "Naina Sethi",
    bloodGroup: "O+",
    contact: "9012345678",
    location: { type: "Point", coordinates: [77.12, 28.72] },
  },

  // Bangalore
  {
    name: "Pranav Shetty",
    bloodGroup: "O+",
    contact: "8123456789",
    location: { type: "Point", coordinates: [77.5946, 12.9716] },
  },
  {
    name: "Megha Nair",
    bloodGroup: "B+",
    contact: "8234567890",
    location: { type: "Point", coordinates: [77.6, 12.98] },
  },
  {
    name: "Rohit Hegde",
    bloodGroup: "A-",
    contact: "8345678901",
    location: { type: "Point", coordinates: [77.58, 12.96] },
  },

  // Kolkata
  {
    name: "Anirban Ghosh",
    bloodGroup: "O+",
    contact: "8456789012",
    location: { type: "Point", coordinates: [88.3639, 22.5726] },
  },
  {
    name: "Mouli Banerjee",
    bloodGroup: "A+",
    contact: "8567890123",
    location: { type: "Point", coordinates: [88.37, 22.58] },
  },

  // Chennai
  {
    name: "Arvind Subramani",
    bloodGroup: "B+",
    contact: "8678901234",
    location: { type: "Point", coordinates: [80.2707, 13.0827] },
  },
  {
    name: "Keerthana Ravi",
    bloodGroup: "O-",
    contact: "8789012345",
    location: { type: "Point", coordinates: [80.28, 13.09] },
  },

  // Pune
  {
    name: "Omkar Jagtap",
    bloodGroup: "A+",
    contact: "8890123456",
    location: { type: "Point", coordinates: [73.8567, 18.5204] },
  },
  {
    name: "Tanvi Kale",
    bloodGroup: "AB+",
    contact: "8901234567",
    location: { type: "Point", coordinates: [73.86, 18.53] },
  },

  // Jaipur
  {
    name: "Lakshya Rathore",
    bloodGroup: "O+",
    contact: "9123456780",
    location: { type: "Point", coordinates: [75.7873, 26.9124] },
  },
  {
    name: "Pihu Choudhary",
    bloodGroup: "B-",
    contact: "9023456781",
    location: { type: "Point", coordinates: [75.79, 26.92] },
  },

  // Lucknow
  {
    name: "Aman Srivastava",
    bloodGroup: "A+",
    contact: "8912345670",
    location: { type: "Point", coordinates: [80.9462, 26.8467] },
  },
  {
    name: "Shreya Tripathi",
    bloodGroup: "O+",
    contact: "8823456781",
    location: { type: "Point", coordinates: [80.95, 26.85] },
  },

  // Ahmedabad
  {
    name: "Dhruv Trivedi",
    bloodGroup: "B+",
    contact: "8734567892",
    location: { type: "Point", coordinates: [72.5714, 23.0225] },
  },
  {
    name: "Mahi Vyas",
    bloodGroup: "A-",
    contact: "8645678903",
    location: { type: "Point", coordinates: [72.58, 23.03] },
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing users
    await User.deleteMany({});
    console.log("Cleared existing users");

    // Insert dummy donors
    const createdUsers = await User.insertMany(DUMMY_DONORS);
    console.log(`✅ Added ${createdUsers.length} dummy donors`);

    // Verify geo index
    await User.collection.dropIndex("location_2dsphere").catch(() => {});
    await User.collection.createIndex({ location: "2dsphere" });
    console.log("✅ Geo-index verified");

    console.log("\nDummy data loaded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error.message);
    process.exit(1);
  }
};

seedDatabase();
