const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  obj = {
    name: "tushar",
    route: "auth",
  };
  res.json(obj);
});

module.exports = router;
