const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");

const { createUser, searchUsers, getCurrentUser } = require("../controllers/userController");

//Get current user profile
router.get("/me", protect, getCurrentUser);

//Add user
router.post("/", protect, createUser);

//Search nearby users
router.get("/search", protect, searchUsers);

module.exports = router;
