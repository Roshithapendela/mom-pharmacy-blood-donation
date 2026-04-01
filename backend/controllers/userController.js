const User = require("../models/User");

const createUser = async (req, res) => {
  try {
    const { name, bloodGroup, latitude, longitude } = req.body;

    if (
      !name ||
      !bloodGroup ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = new User({
      name,
      bloodGroup,
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
    });

    await user.save();

    res.status(201).json({
      message: "User added successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { bloodGroup, latitude, longitude, radius } = req.query;

    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ message: "Latitude and longitude are required" });
    }

    const parsedLatitude = parseFloat(latitude);
    const parsedLongitude = parseFloat(longitude);
    const parsedRadius = Number.isFinite(parseInt(radius, 10))
      ? parseInt(radius, 10)
      : 10000;

    if (Number.isNaN(parsedLatitude) || Number.isNaN(parsedLongitude)) {
      return res
        .status(400)
        .json({ message: "Invalid latitude/longitude values" });
    }

    const matchStage = bloodGroup && bloodGroup !== "all" ? { bloodGroup } : {};

    const users = await User.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parsedLongitude, parsedLatitude],
          },
          distanceField: "distance",
          maxDistance: parsedRadius,
          spherical: true,
          query: matchStage,
        },
      },
      { $sort: { distance: 1 } },
      {
        $addFields: {
          distanceKm: { $round: [{ $divide: ["$distance", 1000] }, 2] },
        },
      },
    ]);

    res.status(200).json({
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId).select(
      "name email bloodGroup contact location"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const [longitude, latitude] = user.location.coordinates;

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bloodGroup: user.bloodGroup,
        contact: user.contact,
        latitude,
        longitude,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createUser,
  searchUsers,
  getCurrentUser,
};
