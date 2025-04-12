const Employee = require("../models/Employee");
const EmployeeDepartment = require("../models/EmployeeDepartment.models");
const EmployeeRole = require("../models/EmployeeRole.models");

async function updateEmployeeDepartmentOrRole(employeeId, employeeData) {
  if (employeeData.departmentId) {
    await EmployeeDepartment.destroy({
      where: {
        EmployeeId: employeeId,
      },
    });

    await EmployeeDepartment.create({
      EmployeeId: employeeId,
      DepartmentId: employeeData.departmentId,
    });
  }

  if (employeeData.roleId) {
    await EmployeeRole.destroy({
      where: {
        EmployeeId: employeeId,
      },
    });

    await EmployeeRole.create({
      EmployeeId: employeeId,
      RoleId: employeeData.roleId,
    });
  }
}

async function deleteEmployeeById(employeeId) {
  const deletedCount = await Employee.destroy({
    where: {
      id: employeeId,
    },
  });

  await EmployeeDepartment.destroy({
    where: {
      EmployeeId: employeeId,
    },
  });

  await EmployeeRole.destroy({
    where: {
      EmployeeId: employeeId,
    },
  });

  return deletedCount;
}

module.exports = { updateEmployeeDepartmentOrRole, deleteEmployeeById };
