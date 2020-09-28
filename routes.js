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
      console.log("============= ERROR ==============");
      console.log(err);
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
    const currentUser = await req.currentUser;

    // if a users exist
    if (currentUser) {
      const user = await User.findByPk(currentUser.id, {
        attributes: { exclude: ["password", "createdAt", "updatedAt"] },
      });
      console.log(user);
      res.location("/").json(user);
    }
  })
);

// create a new user
router.post(
  "/users",
  asyncHandler(async (req, res) => {
    let password = req.body.password;
    //hashing user passwords
    if (password) {
      password = await bcryptjs.hashSync(password);
      const users = await User.findAll();

      if (users) {
        // Check for duplicate email address
        if (
          !users.find((user) => user.emailAddress === req.body.emailAddress)
        ) {
          console.log("false");
          const user = await User.create(req.body);
          res.status(201).location("/").end();
        } else {
          res.status(409).json({ message: "Duplicate Email Address" });
        }
      } else {
        res.status(404).json({ message: "Message Not Found" });
      }
    } else {
      res.status(401).json({ message: "Password cannot be blank and empty" });
    }
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
          as: "Owner",
          attributes: {
            exclude: ["createdAt", "updatedAt", "password"],
          },
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });
    res.status(200).json(courses);
  })
);

// GET /api/courses/:id returns the courses for :id user, status=200
router.get(
  "/courses/:id",
  asyncHandler(async (req, res, next) => {
    const courseId = await req.params.id;

    // Find the course by its ID in the database.
    if (courseId) {
      console.log(courseId);
      const course = await Course.findByPk(courseId, {
        include: [
          {
            model: User,
            as: "Owner",
            attributes: {
              exclude: ["createdAt", "updatedAt", "password"],
            },
          },
        ],
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      });
      // If the course exist, return it 
      if (course) {
        res.json(course)
      } else {
        // else set status code to 404 then 
        res.status(404).json({message: "Course not found. Invalid CourseID."})
      }
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
    let course = req.body;
    console.log(req.body)
    if (course) {
      if (course.userId) {
        if (course.title) {
          if(course.description){
            course = await Course.create(req.body);
              res
                .status(201)
                .location("/courses/" + course.id)
                .end();
          }else{
            res.status(404).json({message: "Please provide a description for the course."})
          }
        } else {
          res.status(404).json({message: "Please provide a title for the course."})
        }
      } else {
        res.status(404).json({message: "You did not provide the user id for the course owner."})
      }
    } else {
      res.status(400).json({message: "you did not provide the information for the course."})
    }
    
  })
);

// PUT /api/courses/:id updates course for :id, satus=204
router.put(
  "/courses/:id",
  authenticateUser,
  asyncHandler(async (req, res, next) => {
    const course = await Course.findByPk(req.params.id, {
      include: [{ model: User, as: "Owner" }],
    });

    if (course) {
      if (course.Owner.emailAddress === req.currentUser.emailAddress) {
        await course.update(req.body);
        res.status(204).end();
      } else {
        res.status(403).json({
          message: "You do not have authorization to alter this course.",
        });
      }
    } else {
      res.status(404).json({ message: "Course Not Found" });
    }
  })
);

router.delete(
  "/courses/:id",
  authenticateUser,
  asyncHandler(async (req, res) => {
    // Find the course to delete by its PK
    const course = await Course.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "Owner",
        },
      ],
    });

    // if the course exist
    // Delete it and send a status of 204
    // Else, return

    if (course) {
      if (course.Owner.emailAddress === req.currentUser.emailAddress) {
        await course.destroy();
        res.status(204).end();
      } else {
        res.status(403).json({
          message: "You do not have authorization to alter this course.",
        });
      }
    } else {
      res.status(404).json({ message: " Course Not Found." });
    }
    console.log(course.User.emailAddress);
    console.log(req.currentUser.emailAddress);

    res.status(200).json(course.User.emailAddress).end();
  })
);
module.exports = router;
