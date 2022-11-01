const inquirer = require('inquirer');
const mysql = require('mysql2');

const PORT = 3000;
// const app = express();


// connect to databse
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'employees_db'
    },
    console.log(`Connected to the employees_db database.`)
)

function addDepartment() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'What is the name of the deparmtnet?'
        }
    ]).then(({name}) =>{
        db.query(`INSERT INTO departments (name) VALUES ('${name}');`, function (err, results) {
            if (err) {
                console.log(err)
            } else{
                console.log(`\n---- A department has been added :${name}`);
            }
            askWhatToDo();
        });
        
    });

    
}

function viewAllDepartments(){
    db.query('SELECT * FROM departments ', function (err, results) {
        console.table(results);
        askWhatToDo() ;
      });      
}

function viewAllRoles() {
    const sql = 
    `SELECT roles.id, title, departments.name, salary 
    FROM roles 
    LEFT JOIN departments ON department_id = departments.id;`
    db.query('SELECT roles.id, title, departments.name, salary FROM roles JOIN departments ON department_id = departments.id ', function (err, results) {
        console.table(results);
        askWhatToDo() ;
      });  
}

function viewAllEmployees() {
    const sql = 
    `SELECT e.id, e.first_name AS 'first name', e.last_name AS 'last name', roles.title, departments.name, roles.salary, m.first_name AS 'Manager first name', m.last_name AS 'Manager last name'
    FROM employees AS e
    LEFT JOIN roles ON role_id = roles.id 
    LEFT JOIN departments ON department_id = departments.id 
    LEFT JOIN employees AS m ON e.manager_id = m.id;`;
    db.query(sql, function (err, results) {
        console.table(results);
        askWhatToDo() ;
      });  
}

function addRole(){
    db.query('SELECT * FROM departments ', function (err, results_depts) {
        // results value for dept will be the id of the department
        const choiceArr = results_depts.map(dept => ({value: dept.id, name: dept.name}) )
        // console.log(choiceArr)  
        inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'What is the name of the role?'
            },
            {
                type: 'input',
                name: 'salary',
                message: 'What is the salary of the role?'
            },
            {
                type: 'list',
                name: 'deptId',
                message: 'Which department does the role belong to?',
                choices: choiceArr
            }
        ]).then(({title, salary, deptId}) => {

            const sql = `INSERT INTO roles (title, salary, department_id ) VALUES (?,?,?);`
            db.query(sql, [title, salary, deptId], function (err, results) {
                if (err) {
                    console.log(err)
                } else{
                    console.log(`---- A role has been added to the database :${title}`);
                }
                askWhatToDo();
            });
        })

    });

    
}

function addEmployee() {
    db.query('SELECT * FROM roles ', function (err, results_roles) {
        const roleChoiceArr = results_roles.map(role => ({value: role.id, name: role.title}) );

        db.query('SELECT * FROM employees', function (err, result_employees) {
            const managerChoiceArr = result_employees.map(person => ({value:person.id, name:person.first_name+' '+person.last_name}))  
            managerChoiceArr.unshift({value:null, name:'None'});
            inquirer.prompt([
                {
                    type: 'input',
                    name: 'firstName',
                    message: "What is the employee's first name?"
                },
                {
                    type: 'input',
                    name: 'lastName',
                    message: "What is the employee's last name?"
                },
                {
                    type: 'list',
                    name: 'roleId',
                    message: "What is the employee's role?",
                    choices: roleChoiceArr
                },
                {
                    type: 'list',
                    name: 'managerId',
                    message: "What is the employee's manager?",
                    choices: managerChoiceArr
                }
            ]).then(({firstName, lastName, roleId, managerId}) => {
                // console.log(firstName, lastName, roleId, managerId);
    
                const sql = `INSERT INTO employees (first_name, last_name, role_id, manager_id ) VALUES (?,?,?,?);`;
                db.query(sql, [firstName, lastName, roleId, managerId], function (err, results) {
                    if (err) {
                        console.log(err)
                    } else{
                        console.log(`---- An employee has been added to the database :${firstName} ${lastName} `);
                    }
                    askWhatToDo();
                });
            })
        })
        
        
    
    });
    
}

function updateRole() {
    db.query('SELECT * FROM employees', function (err, result_employees) {
        const employeeChoiceArr = result_employees.map(person => ({value:person.id, name:person.first_name+' '+person.last_name}))  

        db.query('SELECT * FROM roles ', function (err, results_roles) {
            const roleChoiceArr = results_roles.map(role => ({value: role.id, name: role.title}) );

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'employeeId',
                    message: "Which employee's role do you want to update?",
                    choices: employeeChoiceArr
                },
                {
                    type: 'list',
                    name: 'roleId',
                    message: "Which role do you wnat to assign the selected employee?",
                    choices: roleChoiceArr
                }
            ]).then(({employeeId, roleId}) => {

                const sql = `UPDATE employees SET role_id = ? WHERE id = ?;`;

                db.query(sql, [roleId, employeeId], function (err, results) {
                    if (err) {
                        console.log(err)
                    } else{
                        console.log(`---- Updated employee's role `);
                    }
                    askWhatToDo();
                });
            })
        })
    });

}

function askWhatToDo() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'toDo',
            message: 'What do you want to do next?',
            choices: [
                'View all departments',
                'View all roles',
                'View all employees',
                'Add a department',
                'Add a role',
                'Add an employee',
                'Update an employee role'
            ]
        }
    ]).then(({toDo}) =>{
        switch(toDo) {
            case 'View all departments':
                viewAllDepartments();
                break;
            case 'View all roles':
                viewAllRoles()
                break;
            case 'View all employees':
                viewAllEmployees();
                break;
            case 'Add a department':
                // console.log('Add a department');
                addDepartment();
                break;
            case 'Add a role':
                // console.log('Add a role');
                addRole();
                break;
            case 'Add an employee':
                addEmployee();
                break;
            case 'Update an employee role':
                updateRole();
                break;
            default:
                console.log('Error: something wrong with select toDo options')
                break;
        }
        
        
    })

    
}

function init(){
    console.log('** Welcome to the employee management systme');

    askWhatToDo();
}

init();

// Default response for any other request (Not Found)
// app.use((req, res) => {
//     res.status(404).end();
// });

// app.listen(PORT, ()=> {
//     console.log(`Server running on port ${PORT}`)
// })

