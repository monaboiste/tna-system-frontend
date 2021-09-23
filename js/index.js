import { apiUrl } from './api.js';

// Fetch all employees
$(() => {
    const userId = localStorage.getItem('userId');
    const b64token = localStorage.getItem('token');
    let headers = new Headers();
    headers.append('Content-type', 'application/json')
    headers.append('Authorization', 'Basic ' + b64token);
    const requestOptions = {
        method: 'GET',
        headers: headers,
    };

    fetch(`${apiUrl}/employees/${userId}`, requestOptions)
        .then(response => response.json())
        .then(employee => {
            if (employee) {
                $('#employeeFirstname').html(employee.firstName);
                $('#employeeLastname').html(employee.lastName);
                $('#employeeAddress').html(`${employee.street}, ${employee.postCode} ${employee.city}`);
                $('#employeeDepartment').html(employee.department);
                $('#employeeContractId').html(employee.contractId);
            }
        })
        .catch(err => console.error(err));
});