// Fetch all employees
document.addEventListener('DOMContentLoaded', function () {
    const userId = localStorage.getItem('userId');
    const b64token = localStorage.getItem('token');
    let headers = new Headers();
    headers.append('Content-type', 'application/json')
    headers.append('Authorization', 'Basic ' + b64token);
    const requestOptions = {
        method: 'GET',
        headers: headers,
    };

    fetch(`http://localhost:8080/api/employees/${userId}`, requestOptions)
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            return Promise.reject(response);
        })
        .then(function (employee) {
            if (employee) {
                $('#employeeFirstname').html(employee.firstName);
                $('#employeeLastname').html(employee.lastName);
                $('#employeeAddress').html(`${employee.street}, ${employee.postCode} ${employee.city}`);
                $('#employeeDepartment').html(employee.department);
                $('#employeeContractId').html(employee.contractId);
            }
        })
        .catch(error => console.log('error', error));
});