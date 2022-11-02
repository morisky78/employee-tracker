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


-- SELECT roles.id, title, departments.name, salary 
-- FROM roles 
-- LEFT JOIN departments ON department_id = departments.id;

SELECT manager_id
FROM employees AS e 
GROUP BY manager_id;

SELECT e.id, e.first_name, e.last_name, roles.title, departments.name, roles.salary, m.first_name, m.last_name
    FROM employees AS e
    LEFT JOIN roles ON role_id = roles.id 
    LEFT JOIN departments ON department_id = departments.id 
    LEFT JOIN employees AS m ON e.manager_id = m.id;

-- get only managers name and id
-- SELECT m.id, m.first_name, m.last_name
-- FROM employees AS e 
-- JOIN employees AS m ON e.manager_id = m.id
-- GROUP BY e.manager_id;


-- SELECT e.id, e.first_name AS 'first name', e.last_name AS 'last name', roles.title, departments.name, roles.salary, m.first_name AS 'manager first name', m.last_name  AS 'manager last name' , e.manager_id
--             FROM employees AS e
--             LEFT JOIN roles ON role_id = roles.id 
--             LEFT JOIN departments ON department_id = departments.id 
--             LEFT JOIN employees AS m ON e.manager_id = m.id
--             ORDER BY e.manager_id;
-- ;
-- SELECT employees.id AS id, first_name, last_name, title FROM employees LEFT JOIN roles ON role_id = roles.id

SELECT  departments.name AS department, SUM(salary) AS budget
FROM employees 
LEFT JOIN roles ON role_id = roles.id 
LEFT JOIN departments ON department_id = departments.id
GROUP BY department_id
