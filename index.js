const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table')

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


function answerRequired(input) {
    if (!input) {
        return `This field is required!`;
    } return true;
}

function isNumber(input) {
    if ( isNaN(input) || !input) return 'Please enter numeric value for salary.'
    else return true;
}

function viewAllDepartments(){
    const sql = 'SELECT * FROM departments ';
    db.query(sql, function (err, results) {
        if (err) console.log(err);
        if ( results.length === 0 ) console.log('✴--- No department data exists.')
        else console.table(results);
        askWhatToDo() ;
    });      
}

function viewAllRoles() {
    const sql = 
    `SELECT roles.id as ID, title as Role, departments.name AS Department, salary AS Salary 
    FROM roles 
    LEFT JOIN departments ON department_id = departments.id;`
    db.query(sql, function (err, results) {
        if (err) throw (err);
        if ( results.length === 0 ) console.log('✴--- No role data exists.')
        else console.table(results);
        askWhatToDo() ;
    });  
}

function viewAllEmployees() {
    const sql = 
    `SELECT e.id AS ID, e.first_name AS 'First Name', e.last_name AS 'Last Name', roles.title AS Role, departments.name As Department, roles.salary AS Salary, CONCAT_WS(' ', m.first_name, m.last_name) AS Manager
    FROM employees AS e
    LEFT JOIN roles ON role_id = roles.id 
    LEFT JOIN departments ON department_id = departments.id 
    LEFT JOIN employees AS m ON e.manager_id = m.id;`;
    db.query(sql, function (err, results) {
        if (err) throw (err);
        if ( results.length === 0 ) console.log('✴--- No employee data exists.')
        else console.table(results);
        askWhatToDo() ;
    });  
}

function viewByManager(){
    // get manager's id
    const sql = `SELECT m.id, m.first_name, m.last_name
    FROM employees AS e 
    JOIN employees AS m ON e.manager_id = m.id
    GROUP BY e.manager_id;`
    db.query(sql, function (err, results) {
        const managerChoiceArr = results.map(manager => ({value: manager.id, name: manager.first_name+' '+manager.last_name}) )
        managerChoiceArr.push( {value: 'NULL', name:"No manager"}, {value:'ALL', name:'View all group by manager'})
        inquirer.prompt([
            {
                type: 'list',
                name: 'managerId',
                message: `Which manager's employees do you want to see?`,
                choices: managerChoiceArr
            }
        ]).then(({managerId}) => {
            console.log(managerId)
            let findstr =  ``;
            if (managerId == 'NULL') {
                findstr = `WHERE e.manager_id IS NULL `;
            } else if ( managerId == 'ALL') {
                findstr = `ORDER BY e.manager_id `;
            } else {
                findstr =  `WHERE e.manager_id = ? `; 
            }

            const sql_e = `SELECT e.id AS ID, e.first_name AS 'First Name', e.last_name AS 'Last Name', roles.title AS Role, departments.name As Department, roles.salary AS Salary, CONCAT_WS(' ', m.first_name, m.last_name) AS Manager
            FROM employees AS e
            LEFT JOIN roles ON role_id = roles.id 
            LEFT JOIN departments ON department_id = departments.id 
            LEFT JOIN employees AS m ON e.manager_id = m.id
            ${findstr} ;`;

            db.query(sql_e, [managerId], function (err, results) {
                if (err) {
                    console.log(err)
                } else{
                    console.table(results);
                }
                askWhatToDo();
            });

        })

    });  
}

function viewByDepartment() {
    // get existing departments id
    const sql = `SELECT * FROM departments`;
    db.query(sql, function (err, results) {
        const deptChoiceArr = results.map(dept => ({value: dept.id, name: dept.name}) );

        inquirer.prompt([
            {
                type: 'list',
                name: 'deptId',
                message: `Which department's employees do you want to see?`,
                choices: deptChoiceArr
            }
        ]).then(({deptId}) => {

            const sql_d = `SELECT e.id AS ID, e.first_name AS 'First Name', e.last_name AS 'Last Name', roles.title AS Role, departments.name As Department, roles.salary AS Salary, CONCAT_WS(' ', m.first_name, m.last_name) AS Manager
            FROM employees AS e
            LEFT JOIN roles ON role_id = roles.id 
            LEFT JOIN departments ON department_id = departments.id 
            LEFT JOIN employees AS m ON e.manager_id = m.id 
            WHERE roles.department_id = ?;`;

            db.query(sql_d, [deptId], function (err, results) {
                if (err) {
                    console.log(err)
                } else{
                    console.table(results);
                }
                askWhatToDo();
            });

        })

    })
}

function addDepartment() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: '-- What is the name of the department?',
            validate(input) { return answerRequired(input); } 
        }
    ]).then(({name}) =>{
        db.query(`INSERT INTO departments (name) VALUES ('${name}');`, function (err, results) {
            if (err) throw (err);
            if (results.affectedRows === 1) console.log(`✴--- The department has been added to the database.`);
            askWhatToDo();
        });
        
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
                message: '-- What is the name of the role?',
                validate(input) { return answerRequired(input); } 
            },
            {
                type: 'input',
                name: 'salary',
                message: '-- What is the salary of the role?',
                validate(input) { return isNumber(input); } 
            },
            {
                type: 'list',
                name: 'deptId',
                message: '-- Which department does the role belong to?',
                choices: choiceArr
            }
        ]).then(({title, salary, deptId}) => {

            const sql = `INSERT INTO roles (title, salary, department_id ) VALUES (?,?,?);`
            db.query(sql, [title, salary, deptId], function (err, results) {
                if (err) {
                    console.log(err)
                } else{
                    console.log(`✴--- The role has been added to the database.`);
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
                    message: "-- What is the employee's first name?",
                    validate(input) { return answerRequired(input); } 
                },
                {
                    type: 'input',
                    name: 'lastName',
                    message: "-- What is the employee's last name?",
                    validate(input) { return answerRequired(input); } 
                },
                {
                    type: 'list',
                    name: 'roleId',
                    message: "-- What is the employee's role?",
                    choices: roleChoiceArr
                },
                {
                    type: 'list',
                    name: 'managerId',
                    message: "-- Who is the employee's manager?",
                    choices: managerChoiceArr
                }
            ]).then(({firstName, lastName, roleId, managerId}) => {
    
                const sql = `INSERT INTO employees (first_name, last_name, role_id, manager_id ) VALUES (?,?,?,?);`;
                db.query(sql, [firstName, lastName, roleId, managerId], function (err, results) {
                    if (err) {
                        console.log(err)
                    } else{
                        console.log(`✴--- An employee has been added to the database : ${firstName} ${lastName}`);
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
                    message: "-- Which employee's role do you want to update?",
                    choices: employeeChoiceArr
                },
                {
                    type: 'list',
                    name: 'roleId',
                    message: "-- Which role do you want to assign the selected employee?",
                    choices: roleChoiceArr
                }
            ]).then(({employeeId, roleId}) => {

                const sql = `UPDATE employees SET role_id = ? WHERE id = ?;`;
                db.query(sql, [roleId, employeeId], function (err, results) {
                    if (err) {
                        console.log(err)
                    } else{
                        console.log(`✴--- The employee's role has been updated.`);
                    }
                    askWhatToDo();
                });
            })
        })
    });

}

function updateManager() {
    db.query('SELECT * FROM employees', function (err, result_employees) {
        const employeeChoiceArr = result_employees.map(person => ({value:person.id, name:person.first_name+' '+person.last_name}))  
        inquirer.prompt([
            {
                type: 'list',
                name: 'employeeId',
                message: "-- Which employee's manager do you want to update?",
                choices: employeeChoiceArr
            },
            {
                type: 'list',
                name: 'managerId',
                message: "-- Which manager do you wnat to assign the selected employee?",
                choices: employeeChoiceArr
            }
        ]).then(({employeeId, managerId}) => {

            const sql = `UPDATE employees SET manager_id = ? WHERE id = ?;`;

            db.query(sql, [managerId, employeeId], function (err, results) {
                if (err) {
                    console.log(err)
                } else{
                    console.log(`✴--- The employee's manager has been updated.`);
                }
                askWhatToDo();
            });
        })
    
    });
}

function deleteDeparmtnet() {
    // get existing departments id
    const sql = `SELECT * FROM departments`;
    db.query(sql, function (err, results) {
        if (err) console.log(err);
        if ( results.length === 0 ) {
            console.log('✴--- No department data exists.');
            askWhatToDo();
        } else {
            const deptChoiceArr = results.map(dept => ({value: dept.id, name: dept.name}) );

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'deptId',
                    message: `-- Which department do you want to delete?`,
                    choices: deptChoiceArr
                }
            ]).then(({deptId}) => {
                const sql_d = `DELETE FROM departments WHERE id = ? ;`;

                db.query(sql_d, deptId , function (err, results) {
                    if (err) {
                        console.log(err)
                    } else{
                        if (results.affectedRows === 1){
                            console.log(`✴--- The department has been deleted.`)
                        }
                    }
                    askWhatToDo();
                });
                
            })
        }
        
    })    
}

function deleteRole() {
    // get existing roles to display the choices
    const sql = `SELECT * FROM roles`;
    db.query(sql, function (err, results) {
        if (err) console.log(err);
        if ( results.length === 0 ) {
            console.log('✴--- No department data exists.')
            askWhatToDo();
        } else {
            const choiceArr = results.map(item => ({value: item.id, name: item.title}) );
            inquirer.prompt([
                {
                    type: 'list',
                    name: 'id',
                    message: `-- Which role do you want to delete?`,
                    choices: choiceArr
                }
            ]).then(({id}) => {

                const sql_d = `DELETE FROM roles WHERE id = ? ;`;

                db.query(sql_d, id , function (err, results) {
                    if (err) {
                        console.log(err)
                    } else{
                        if (results.affectedRows === 1){
                            console.log(`✴--- The role has been deleted`)
                        }
                    }
                    askWhatToDo();
                });
                
            })

        }
       

    })    
}

function deleteEmployee() {
    // get existing departments id
    const sql = `SELECT employees.id AS id, first_name, last_name, title FROM employees LEFT JOIN roles ON role_id = roles.id `;
    db.query(sql, function (err, results) {
        // console.log(results)
        const choiceArr = results.map(item => ({value: item.id, name: item.first_name+' '+item.last_name+' /'+item.title}) );

        inquirer.prompt([
            {
                type: 'list',
                name: 'id',
                message: `-- Which employee do you want to delete?`,
                choices: choiceArr
            }
        ]).then(({id}) => {

            const sql_d = `DELETE FROM employees WHERE id = ? ;`;

            db.query(sql_d, id , function (err, results) {
                if (err) {
                    console.log(err)
                } else{
                    if (results.affectedRows === 1){
                        console.log(`✴---  An employee has been deleted`)
                    }
                }
                askWhatToDo();
            });

        })

    })    
}

function viewBudget(){
    const sql = `SELECT  departments.name AS department, SUM(salary) AS budget
    FROM employees 
    LEFT JOIN roles ON role_id = roles.id 
    LEFT JOIN departments ON department_id = departments.id
    GROUP BY department_id;`

    db.query(sql, function (err, results) {
        console.table(results)
        askWhatToDo();
    })   
}

function askWhatToDo() {
    const whatToDoChoices = [
        {value:1 , name: "View all departments"},
        {value:2 , name: "View all roles"},
        {value:3 , name: "View all employees"},
        {value:4 , name: "Add a department"},
        {value:5 , name: "Add a role"},
        {value:6 , name: "Add an employee"},
        {value:7 , name: "Update an employee role"},
        {value:8 , name: "Update employee's manager"},
        {value:9 , name: "View employees by manager"},
        {value:10 , name: "View employees by department"},
        {value:11 , name: "Delete a department"},
        {value:12 , name: "Delete a role"},
        {value:13 , name: "Delete an employee"},
        {value:14 , name: "View the total utilized budget"}
    ]
    inquirer.prompt([
        {
            type: 'list',
            name: 'toDo',
            message: 'What would you like to do?',
            choices: whatToDoChoices 
        }
    ]).then(({toDo}) =>{
        switch(toDo) {
            case 1:
                viewAllDepartments();
                break;
            case 2:
                viewAllRoles()
                break;
            case 3:
                viewAllEmployees();
                break;
            case 4:
                addDepartment();
                break;
            case 5:
                addRole();
                break;
            case 6:
                addEmployee();
                break;
            case 7:
                updateRole();
                break;
            case 8:
                updateManager();
                break;
            case 9:
                viewByManager();
                break;
            case 10:
                viewByDepartment();
                break;
            case 11:
                deleteDeparmtnet();
                break;
            case 12:
                deleteRole();
                break;
            case 13:
                deleteEmployee();
                break;
            case 14:
                viewBudget();
                break;
            default:
                console.log('Error: something wrong with select toDo options')
                break;
        }
        
        
    })

    
}

function init(){
    console.log(`
,----------------------------------------------------------,
|             E M P L O Y E E   M A N A G E R              |
*----------------------------------------------------------*    
`);

    askWhatToDo();
}

init();


