const express = require("express");
const { signUp, login, getAllUsers } = require("../controllers/userController");
const verifyToken = require("../middleware/auth");

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", login);
router.get("/getAllUsers", verifyToken, getAllUsers);

module.exports = router;
