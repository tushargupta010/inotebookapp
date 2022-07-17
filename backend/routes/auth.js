const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "TusharGoodbuoy";

// Create a user using POST "/api/auth/createUser". No login required
router.post(
  "/createUser",
  // validations applied
  [
    body("name", "Enter valid name").isLength({ min: 3 }),
    body("email", "Enter valid email").isEmail(),
    body("password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }
    try {
      // checking if user with same email exists or not
      let user = await User.findOne({ email: req.body.email });
      console.log(user);
      if (user) {
        return res.status(400).json({
          error: "Error : user with " + req.body.email + " already exists.",
        });
      }

      // securing password using bcryptjs
      const salt = await bcrypt.genSalt(10);
      const secPassword = await bcrypt.hash(req.body.password, salt);
      // Create a user
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPassword,
      });

      // implementing jwt token
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);

      res.json({ authToken });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Authenticate a user using POST "/api/auth/login". No login required
router.post(
  "/login",
  [
    body("email", "Enter valid email").isEmail(),
    body("password", "Password cannot be empty").exists(),
  ],
  async (req, res) => {
    // checking if user with same email exists or not
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    const { email, password } = req.body;
    try {
      // checking if user exists or not
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ error: "Login Credentials are not valid." });
      }

      // comparing password if user exists
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res
          .status(400)
          .json({ error: "Login Credentials are not valid." });
      }

      // implementing jwt token
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      res.json({ authToken });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

module.exports = router;
