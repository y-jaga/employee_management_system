const { DataTypes, sequelize } = require("../lib/init.js");

const Department = sequelize.define(
  "Department",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { timestamps: true }
);



module.exports = Department;
