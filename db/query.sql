USE employees_db;

-- INSERT INTO employees (first_name, last_name, role_id, manager_id)
-- VALUES 
-- ('Jisoo', 'Hong', 2, NULL),
-- ('Morgan', 'Lee', 3, 2);

SELECT e.id, e.first_name, e.last_name, roles.title, departments.name, roles.salary, m.first_name, m.last_name
    FROM employees AS e
    LEFT JOIN roles ON role_id = roles.id 
    LEFT JOIN departments ON department_id = departments.id 
    LEFT JOIN employees AS m ON e.manager_id = m.id;


SELECT roles.id, title, departments.name, salary 
FROM roles 
LEFT JOIN departments ON department_id = departments.id;

UPDATE employees
SET role_id = 3
WHERE id = 1