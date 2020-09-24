"use strict";

const express = require("express");
const { sequelize, User, Course } = require("./models");
const bcryptjs = require("bcryptjs");
const auth = require("basic-auth");

const router = express.Router();

// Adding async middleware
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (err) {
      next(err);
    }
  };
}

// authentication middleware
const authenticateUser = async (req, res, next) => {
  let message = null;
  const credentials = auth(req);

  const users = await User.findAll();
  // users = users.map(user => user.get({plain: true}))
  // console.log(users.map(u => u.password))

  if (credentials) {
    // console.log(credentials)
    const user = users.find((u) => u.emailAddress === credentials.name);
    // console.log(user.firstName)
    if (user) {
      const authenticated = bcryptjs.compareSync(
        credentials.pass,
        user.password
      );
      // console.log(authenticated)
      if (authenticated) {
        req.currentUser = user;
      } else {
        message = `Authentication failure for username: ${credentials.name}`;
      }
    } else {
      message = `User not found for username: ${credentials.name}`;
    }
  } else {
    message = "Auth header not found";
  }

  if (message) {
    console.warn(message);
    res.status(401).json({ message: "Access Denied" });
  } else {
    next();
  }
};

/** CREATING THE USER ROUTES */

// returning the currently authenticated user
router.get(
  "/users",
  authenticateUser,
  asyncHandler(async (req, res, next) => {
    const user = await req.currentUser;

    // if a users exist
    if (user) {
      res.json({
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddress: user.emailAddress,
        password: user.password,
      });
    } else {
      next(err);
    }
    console.log(user);
  })
);

// create a new user
router.post(
  "/users",
  asyncHandler(async (req, res) => {
    //hashing user passwords
    req.body.password = bcryptjs.hashSync(req.body.password);

    const user = await User.create(req.body);

    res.status(201).location("/").end();
  })
);

/** ROUTES FOR THE COURSE MODEL*/

// GET /api/courses returns all the courses, status=200
router.get(
  "/courses",
  asyncHandler(async (req, res) => {
    const courses = await Course.findAll({
      include: [
        {
          model: User,
        },
      ],
    });

    // console.log(courses.map((course) => course.userId) )
    res.status(200).json(courses.map((course) => course.get({ plain: true })));
  })
);

// GET /api/courses/:id returns the courses for :id user, status=200
router.get(
  "/courses/:id",
  authenticateUser,
  asyncHandler(async (req, res, next) => {
    const courseId = await req.params.id;

    // iF user exist - do this
    if (courseId) {
      console.log(user);
      const course = await Course.findAll({
        where: {
          id: req.params.id,
        },
        include: [
          {
            model: User,
          },
        ],
      });
      res.status(200).json(course);
    } else {
      next(err);
    }
  })
);
// POST /api/courses creates a course , set the location header for the , status=201
router.post(
  "/courses",
  authenticateUser,
  asyncHandler(async (req, res) => {
    const course = await Course.create(req.body);
    res.status(201).location("/").end();
  })
);

// PUT /api/courses/:id updates course for :id, satus=204
router.put(
  "/courses/:id",
  authenticateUser,
  asyncHandler(async (req, res) => {
    // Getting the Current user from the authenticateUser middleware
    const user = await req.currentUser;
    const course = await Course.findByPk(req.params.id);
    console.log(course.userId);
    console.log(user.id);

    // If a course is found
    if (course) {
      // check if the user id for the found course is equal to the id of the current user
      if (course.userId === user.id) {
        await Course.update(req.body, { include: [{ model: User }] });
        res.status(204).json({ message: req.currentUser }).end();
      } else {
        res.status(401).json({
          message: "You do not have authorization to edit this course.",
        });
      }
    } else {
      res.status(404).json({ message: "Course Not Found!" });
    }
    // console.log(course);
    res.status(204).end();
  })
);
// DELETE /api/courses/:id deletes course for :id, status=204
router.delete(
  "/courses/:id",
  authenticateUser,
  asyncHandler(async (req, res) => {
    // console.log(req.params)
    res.status(200).end();
  })
);
module.exports = router;
