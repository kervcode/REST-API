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

/** ROUTES FOR THE COURSE MODEL*/

// GET /api/courses returns all the courses, status=200
router.get('/courses', async (req, res, next) => {
  const courses = await Course.findAll();
  console.log(courses.map((course) => course.userId) )
  res.json(courses.map((course) => course.get({ plain: true })));
})

// GET /api/courses/:id returns the courses for :id user, status=200
router.get('/courses/:id', async (req, res, next) => {
  console.log(req.params)
  res.status(200).end()
})
// POST /api/courses creates a course , set the location header for the , status=201

// PUT /api/courses/:id updates course for :id, satus=204

// DELETE /api/courses/:id deletes course for :id, status=204

module.exports = router;
