"use strict";
const Sequelize = require("sequelize");

//Defining the course model

module.exports = (sequelize) => {
  class Course extends Sequelize.Model {}
  Course.init(
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      // DID NOT ADD USERID - IT IS COMING FROM THE USER TABLE
      title: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.TEXT,
      },
      estimatedTime: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      materialNeeded: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    },
    { sequelize }
  );

  Course.associate = (models) => {
    Course.belongsTo(models.User, {
      foreignKey: {
        firstName: "UserId",
        allowNull: false,
      },
    });
  };

  return Course;
};
