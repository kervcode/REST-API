"use strict";

const express = require("express");
const { sequelize, User, Course } = require("./models");
const bcryptjs = require("bcryptjs");

const router = express.Router();

/** CREATING THE USER ROUTES */

// returning the currently authenticated user
router.get("/users", async (req, res, next) => {
  const users = await User.findAll();

  res.json(users.map((user) => user.get({ plain: true })));
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
