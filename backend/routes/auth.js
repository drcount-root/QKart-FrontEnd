var express = require("express");
var router = express.Router();
const { handleError } = require("../utils");
var { users } = require("../db");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const config = require("../config.json");

router.post("/register", (req, res) => {
  console.log(`GET request to "/auth/register" received for user}`);

  users.findOne({ username: req.body.username }, (err, user) => {
    if (err) {
      return handleError(res, err);
    }
    if (user) {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }
    // if (req.body.username.length < 6 || req.body.username.length > 32) {
    //     return res.status(400).json({
    //         success: false,
    //         message:
    //             'Username must be between 6 and 32 characters in length'
    //     });
    // }
    // if (req.body.password.length < 6 || req.body.password.length > 32) {
    //     return res.status(400).json({
    //         success: false,
    //         message:
    //             'Password must be between 6 and 32 characters in length'
    //     });
    // }
    users.insert({
      username: req.body.username,
      password: sha256(req.body.password),
      balance: 5000,
      cart: [],
      addresses: [],
    });

    console.log(`Registered user: ${req.body.username}`);

    return res.status(201).json({
      success: true,
    });
  });
});

router.post("/login", (req, res) => {
  console.log(`POST request to "/auth/login" received`);

  users.findOne({ username: req.body.username }, (err, user) => {
    if (err) {
      return handleError(res, err);
    }
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Username does not exist",
      });
    }
    if (user.password !== sha256(req.body.password)) {
      return res.status(400).json({
        success: false,
        message: "Password is incorrect",
      });
    }
    const token = jwt.sign({ username: user.username }, config.jwtSecret, {
      expiresIn: "6h",
    });

    console.log(`Logged in as user: ${req.body.username}`);

    return res.status(201).json({
      success: true,
      token: token,
      username: user.username,
      balance: user.balance,
    });
  });
});

const sha256 = (input) =>
  crypto.createHash("sha256").update(input, "utf8").digest("hex");

module.exports = router;
