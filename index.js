const express = require('express');
const inquirer = require('inquirer');
const mysql = require('mysql2');

const PORT = 3000;
const app = express();

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
        if(!name) {
            console.log(`Hmm.. No input is inserted.`);
        } else {
            db.query(`INSERT INTO departments (name) VALUES ('${name}');`, function (err, results) {
                if (err) {
                    throw err
                } else{
                    console.log(results);
                }
            });
        }
        askWhatToDo();
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
                console.log('View all department');
                break;
            case 'View all roles':
                console.log('View all roles');
                break;
            case 'View all employees':
                console.log('View all employees');
                break;
            case 'Add a department':
                // console.log('Add a department');
                addDepartment();
                break;
            case 'Add a role':
                console.log('Add a role');
                break;
            case 'Add an employee':
                console.log('Add an employee');
                break;
            case 'Update an employee role':
                console.log('Update an employee role');
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
app.use((req, res) => {
    res.status(404).end();
});

app.listen(PORT, ()=> {
    console.log(`Server running on port ${PORT}`)
})