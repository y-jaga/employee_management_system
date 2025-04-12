const Department = require("../models/Department");
const Role = require("../models/Role");

function validateOrder(order) {
  if (order.toUpperCase() !== "ASC" && order.toUpperCase() !== "DESC") {
    return "Invalid order value only 'asc' or 'desc' allowed";
  }

  return "";
}

function validateNewEmployee(newEmployee) {
  if (
    !newEmployee.name ||
    !newEmployee.email ||
    !newEmployee.departmentId ||
    !newEmployee.roleId
  ) {
    return "required field are missing name, email, departmentId or roleId";
  }

  return "";
}

async function validateDepartmentAndRole(data) {
  let error = "";

  if (data.departmentId) {
    const isDepartment = await Department.findOne({
      where: {
        id: data.departmentId,
      },
    });

    if (!isDepartment) {
      error = "Provided departmentId does not exists.";
    }
  }

  if (data.roleId) {
    const isRole = await Role.findOne({
      where: {
        id: data.roleId,
      },
    });

    if (!isRole) {
      error = "Provided roleId does not exists.";
    }
  }

  return error;
}

module.exports = {
  validateNewEmployee,
  validateOrder,
  validateDepartmentAndRole,
};
