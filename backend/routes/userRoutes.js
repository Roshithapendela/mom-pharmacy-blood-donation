const express = require("express");
const router = express.Router();

const { createUser, searchUsers } = require("../controllers/userController");

// Add user
router.post("/", createUser);

// Search nearby users
router.get("/search", searchUsers);

module.exports = router;
