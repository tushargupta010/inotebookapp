const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

// Create a user using POST "/api/auth/createUser". No login required
router.post(
  "/createUser",
  // validations applied
  [
    body("name", "Enter valid name").isLength({ min: 3 }),
    body("email", "Enter valid email").isEmail(),
    body("password").isLength({ min: 3 }),
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
      // .then((user) => res.json(user))
      // .catch((err) => {
      //   console.log(err);
      //   res.json({
      //     error: "Please enter a unique value for email",
      //     message: err.message,
      //   });
      // });

      res.json(user);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Some error occured.");
    }
  }
);

module.exports = router;
