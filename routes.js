"use strict";

const express = require("express");
const { sequelize, User, Course } = require("./models");
const bcryptjs = require("bcryptjs");
const auth = require("basic-auth");

const router = express.Router();

// authentication middleware
const authenticateUser = async (req, res, next) => {
  const credentials = auth(req);

  if (credentials) {
    const user = await User.find(u.emailAddress === credentials.emailAddress);

    // If user exist, compare user.password with credentials.password
    if (user) {
      const authenticated = bcryptjs.compareSync(
        credentials.password,
        user.password
      );
      // If a password match is found
      if (authenticated) {
        req.currentUser = user;
      } else {
        message = `Authentication failure for username: ${user.username}`;
      }
    } else {
      message: `Authentication failure for User : ${user.credentials}`;
    }
  } else {
    message = "Authentication not found";
  }

  if (message) {
    console.warn(message);

    // Return a response with a 401 Unauthorized HTTP status code.
    res.status(401).json({ message: "Access Denied" });
  } else {
    // Or if user authentication succeeded...
    // Call the next() method.
    next();
  }
};

/** CREATING THE USER ROUTES */

// returning the currently authenticated user
router.get("/users", authenticateUser, async (req, res, next) => {
  const user = await req.currentUser;

  res.json({
    username: user.emailAddress,
    password: user.password,
  });
});

// create a new user
router.post("/users", async (req, res) => {
  //hashing user passwords
  req.body.password = bcryptjs.hashSync(req.body.password);

  //
  const user = await User.create(req.body);

  res.status(201).location("/").end();
});

module.exports = router;
