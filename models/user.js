"use strict";
const Sequelize = require("sequelize");

//Defining the user model

module.exports = (sequelize) => {
  class User extends Sequelize.Model {}
  User.init(
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      firstName: {
        type: Sequelize.STRING,
      },
      lastName: {
        type: Sequelize.STRING,
      },
      emailAddress: {
        type: Sequelize.STRING,
      },
      password: {
        type: Sequelize.STRING,
      },
    },
    { sequelize }
  );

  // Associate user table with a One-to-Many association with the course table
  User.Associate = (models) => {
    User.hasMany(models.Course, {
      foreignKey: {
        firstName: "UserId",
        allowNull: false,
      },
    });
  };

  return User;
};
