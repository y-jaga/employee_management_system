const express = require("express");
const Department = require("./models/Department");
const Role = require("./models/Role");
const Employee = require("./models/Employee");
const { sequelize } = require("./lib/init");
const EmployeeDepartment = require("./models/EmployeeDepartment.models");
const EmployeeRole = require("./models/EmployeeRole.models");
const { getEmployeeDetails } = require("./helper");
const {
  validateNewEmployee,
  validateOrder,
  validateDepartmentAndRole,
} = require("./validation");
const {
  updateEmployeeDepartmentOrRole,
  deleteEmployeeById,
} = require("./controllers");
const app = express();

app.use(express.json());

// Endpoint to seed database
app.get("/seed_db", async (req, res) => {
  try {
    await sequelize.sync({ force: true });

    const departments = await Department.bulkCreate([
      { name: "Engineering" },
      { name: "Marketing" },
    ]);

    const roles = await Role.bulkCreate([
      { title: "Software Engineer" },
      { title: "Marketing Specialist" },
      { title: "Product Manager" },
    ]);

    const employees = await Employee.bulkCreate([
      { name: "Rahul Sharma", email: "rahul.sharma@example.com" },
      { name: "Priya Singh", email: "priya.singh@example.com" },
      { name: "Ankit Verma", email: "ankit.verma@example.com" },
    ]);

    // Associate employees with departments and roles using create method on junction models
    await EmployeeDepartment.create({
      EmployeeId: employees[0].id,
      DepartmentId: departments[0].id,
    });
    await EmployeeRole.create({
      EmployeeId: employees[0].id,
      RoleId: roles[0].id,
    });

    await EmployeeDepartment.create({
      EmployeeId: employees[1].id,
      DepartmentId: departments[1].id,
    });
    await EmployeeRole.create({
      EmployeeId: employees[1].id,
      RoleId: roles[1].id,
    });

    await EmployeeDepartment.create({
      EmployeeId: employees[2].id,
      DepartmentId: departments[0].id,
    });
    await EmployeeRole.create({
      EmployeeId: employees[2].id,
      RoleId: roles[2].id,
    });

    return res.json({ message: "Database seeded!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// http://localhost:3000/employees

app.get("/employees", async (req, res) => {
  try {
    let employeeDetails = [];
    const employeeResponse = await Employee.findAll();

    if (employeeResponse.length === 0) {
      return res.status(404).json({ error: "No employee found." });
    }

    for (let emp of employeeResponse) {
      employeeDetails.push(await getEmployeeDetails(emp));
    }

    res.status(200).json(employeeDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//http://localhost:3000/employees/details/1

app.get("/employees/details/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const employeeResponse = await Employee.findOne({ where: { id } });

    if (!employeeResponse) {
      return res.status(404).json({ error: "No employee found." });
    }

    const employee = await getEmployeeDetails(employeeResponse);

    res.status(200).json({ employee });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/employees/department/:departmentId", async (req, res) => {
  try {
    const departmentId = parseInt(req.params.departmentId);
    const empDep = await EmployeeDepartment.findAll({
      where: {
        DepartmentId: departmentId,
      },
    });

    const employeeData = [];

    for (let emp of empDep) {
      const employee = await Employee.findOne({
        where: {
          id: emp.EmployeeId,
        },
      });

      employeeData.push(employee);
    }

    const employees = [];

    for (let emp of employeeData) {
      employees.push(await getEmployeeDetails(emp));
    }

    res.status(200).json({ employees });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/employees/role/:roleId", async (req, res) => {
  try {
    const roleId = parseInt(req.params.roleId);

    const employeeAndRoleIds = await EmployeeRole.findAll({
      where: {
        RoleId: roleId,
      },
    });

    const employeeData = [];

    for (let emp of employeeAndRoleIds) {
      employeeData.push(
        await Employee.findOne({
          where: {
            id: emp.EmployeeId,
          },
        })
      );
    }

    const employees = [];
    for (let emp of employeeData) {
      employees.push(await getEmployeeDetails(emp));
    }

    res.status(200).json({ employees });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/employees/sort-by-name", async (req, res) => {
  try {
    const order = req.query.order;

    const error = validateOrder(order);
    if (error.length !== 0) {
      return res.status(400).json({ error });
    }

    const employees = await Employee.findAll({
      order: [["name", order]],
    });

    if (employees.length === 0) {
      return res.status(404).json({ error: "No employees found." });
    }

    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/employees/new", async (req, res) => {
  try {
    const newEmployee = req.body;

    const error = validateNewEmployee(newEmployee);
    if (error.length !== 0) {
      return res.status(400).json({ error });
    }

    const error2 = await validateDepartmentAndRole(newEmployee);
    if (error2.length !== 0) {
      return res.status(404).json({ error: error2 });
    }

    const result = await Employee.create({
      name: newEmployee.name,
      email: newEmployee.email,
    });

    await EmployeeDepartment.create({
      EmployeeId: result.id,
      DepartmentId: newEmployee.departmentId,
    });

    await EmployeeRole.create({
      EmployeeId: result.id,
      RoleId: newEmployee.roleId,
    });

    const employee = await getEmployeeDetails(result);

    res.status(201).json(employee);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/employees/update/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = req.body;

    //check if dapartmentId and roleId exists in db if provided
    const error = await validateDepartmentAndRole(data);
    if (error.length !== 0) {
      return res.status(404).json({ error });
    }

    const employee = await Employee.findOne({
      where: {
        id,
      },
    });

    if (!employee) {
      return res.status(404).json({ error: "employee does not exist." });
    }

    //update employee departmentId and roleId
    if (data.departmentId || data.roleId) {
      await updateEmployeeDepartmentOrRole(id, data);
    }

    //update name, email field if provided in req.body
    employee.set(data);
    await employee.save();

    const updatedEmployee = await getEmployeeDetails(employee);

    res.status(201).json(updatedEmployee);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/employees", async (req, res) => {
  try {
    const id = parseInt(req.body.id);
    const deletedCount = await deleteEmployeeById(id);

    if (deletedCount === 0) {
      return res.status(404).json({ error: "Employee not found." });
    }

    res
      .status(204)
      .json({ message: `Employee with ID ${id} has been deleted.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
