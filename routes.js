"use strict";

const express = require("express");
const { sequelize, User, Course } = require("./models");
const bcryptjs = require("bcryptjs");
const auth = require("basic-auth");

const router = express.Router();

// authentication middleware
const authenticateUser = async (req, res, next) => {
  let message = null;
  const credentials = auth(req);

  const users = await User.findAll()
  // users = users.map(user => user.get({plain: true}))
  // console.log(users.map(u => u.password))
  
  

  if(credentials){
    // console.log(credentials)
    const user = users.find(u => u.emailAddress === credentials.name)
    // console.log(user.firstName)
    if(user){
      const authenticated = bcryptjs.compareSync(credentials.pass, user.password);
      // console.log(authenticated)
      if(authenticated){
        req.currentUser = user;
      } else {
        message = `Authentication failure for username: ${credentials.name}`;
      }
    } else {
      message = `User not found for username: ${credentials.name}`;
    }
  } else {
    message = 'Auth header not found';
  };

  if(message) {
    console.warn(message);
    res.status(401).json({ message: 'Access Denied' })
  } else {
    next()
  }
  
};

/** CREATING THE USER ROUTES */

// returning the currently authenticated user
router.get("/users", authenticateUser, async (req, res, next) => {
  const user = await req.currentUser;
  console.log(user)

  res.json({
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddress: user.emailAddress,
    password: user.password,
  });
});

// create a new user
router.post("/users", async (req, res) => {
  //hashing user passwords
  req.body.password = bcryptjs.hashSync(req.body.password);

  const user = await User.create(req.body);

  res.status(201).location("/").end();
});

/** ROUTES FOR THE COURSE MODEL*/

// GET /api/courses returns all the courses, status=200
router.get('/courses', async (req, res, next) => {
  const courses = await Course.findAll();
  // console.log(courses.map((course) => course.userId) )
  res.json(courses.map((course) => course.get({ plain: true })));
})

// GET /api/courses/:id returns the courses for :id user, status=200
router.get('/courses/:id', async (req, res, next) => {
  // console.log(req.params)
  res.status(200).end()
})
// POST /api/courses creates a course , set the location header for the , status=201
router.post('/courses/:id', authenticateUser, async (req, res, next) => {
  // console.log(req.params)
  res.status(200).end()
})
// PUT /api/courses/:id updates course for :id, satus=204
router.put('/courses/:id', authenticateUser, async (req, res, next) => {
  // console.log(req.params)
  res.status(200).end()
})
// DELETE /api/courses/:id deletes course for :id, status=204
router.delete('/courses/:id', authenticateUser, async (req, res, next) => {
  // console.log(req.params)
  res.status(200).end()
})
module.exports = router;
