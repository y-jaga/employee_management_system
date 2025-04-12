const Department = require("../models/Department");
const EmployeeDepartment = require("../models/EmployeeDepartment.models");
const EmployeeRole = require("../models/EmployeeRole.models");
const Role = require("../models/Role");

// Helper function to get employee's associated departments
async function getEmployeeDepartments(employeeId) {
  const employeeDepartments = await EmployeeDepartment.findAll({
    where: { EmployeeId: employeeId },
  });

  let departmentData;
  for (let empDep of employeeDepartments) {
    departmentData = await Department.findOne({
      where: { id: empDep.DepartmentId },
    });
  }

  return departmentData;
}

// Helper function to get employee's associated roles
async function getEmployeeRoles(employeeId) {
  const employeeRoles = await EmployeeRole.findAll({
    where: {
      EmployeeId: employeeId,
    },
  });

  let roleData;
  for (empRole of employeeRoles) {
    roleData = await Role.findOne({
      where: {
        id: empRole.RoleId,
      },
    });
  }

  return roleData;
}

// Helper function to get employee details with associated departments and roles
async function getEmployeeDetails(employeeData) {
  const department = await getEmployeeDepartments(employeeData.id);
  const role = await getEmployeeRoles(employeeData.id);

  return {
    ...employeeData.dataValues,
    department,
    role,
  };
}

module.exports = { getEmployeeDetails };
