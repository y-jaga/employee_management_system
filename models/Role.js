const { DataTypes, sequelize } = require("../lib/init.js");

const Role = sequelize.define(
  "Role",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
  },
  { timestamps: true }
);



module.exports = Role;
