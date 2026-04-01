const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: token missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const jwtSecret = process.env.JWT_SECRET || "change-me-in-env";
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (_error) {
    return res.status(401).json({ message: "Unauthorized: invalid token" });
  }
};

module.exports = {
  protect,
};
