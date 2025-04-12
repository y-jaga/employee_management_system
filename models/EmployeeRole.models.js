const { sequelize, DataTypes } = require("../lib/init");
const Employee = require("./Employee");
const Role = require("./Role");

const EmployeeRole = sequelize.define("EmployeeRole", {}, { timestamps: true });

Employee.belongsToMany(Role, { through: EmployeeRole });
Role.belongsToMany(Employee, { through: EmployeeRole });

module.exports = EmployeeRole;
