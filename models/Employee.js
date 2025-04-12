const { sequelize, DataTypes } = require("../lib/init.js");

const Employee = sequelize.define(
  "Employee",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
  },
  { timestamps: true }
);

module.exports = Employee;
