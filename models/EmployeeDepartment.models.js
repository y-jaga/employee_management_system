const { sequelize, DataTypes } = require("../lib/init");
const Department = require("./Department");
const Employee = require("./Employee");

const EmployeeDepartment = sequelize.define(
  "EmployeeDepartment",
  {},
  { timestamps: true }
);

Employee.belongsToMany(Department, { through: EmployeeDepartment });
Department.belongsToMany(Employee, { through: EmployeeDepartment });

module.exports = EmployeeDepartment;
