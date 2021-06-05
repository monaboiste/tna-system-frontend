const token = localStorage.getItem('token');

const headers = new Headers();
headers.append('Content-Type', 'application/json');
headers.append('Authorization', `Basic ${token}`);

// Fetch all employees
document.addEventListener('DOMContentLoaded', function () {
    const requestOptions = {
        method: 'GET',
        headers: headers,
    };

    fetch('http://localhost:8080/api/employees', requestOptions)
        .then(response => response.json())
        .then(employees => {
            let employeeTable = document.getElementById('employeeTable');
            let combinedTemplate = '';
            employees.forEach(employee => combinedTemplate += createRecord(employee))
            employeeTable.innerHTML = combinedTemplate;

            // Delete employee
            document.querySelectorAll('.deleteEmployeeButton').forEach(button => {
                button.addEventListener('click', e => {
                    document.getElementById('deleteEmployeeError').textContent = '';
                    document.getElementById('deleteEmployeeName').textContent = e.target.parentElement.parentElement.children[0].innerText;

                    const userId = e.target.parentElement.parentElement.id.split('employeeId')[1];

                    document.getElementById('deleteEmployeeRequest').addEventListener('click', function () {
                        deleteEmployee(userId);
                    })
                });
            });

            document.querySelectorAll('.employeeDetails').forEach(button => {
                button.addEventListener('click', e => {
                    const employeeId = e.target.parentElement.parentElement.id.split('employeeId')[1];
                    // Store for calendar
                    sessionStorage.setItem('currentReviewedEmployeeId', employeeId);

                    fetch(`http://localhost:8080/api/employees/${employeeId}`, requestOptions)
                        .then(response => response.json())
                        .then(employee => {
                            console.log(employee);
                            document.getElementById('employeeDetailsModalBody').innerHTML = createEmployeeDetailsTemplate(employee);
                        })
                        .catch(error => console.log('error', error));
                });
            });
        })
        .catch(error => console.log('error', error));
});

// New employee
document.getElementById('newEmployeeButton').addEventListener('click', function () {
    document.getElementById('newEmployeeError').textContent = '';
});

document.getElementById('newEmployeeRequest').addEventListener('click', function () {
    let formData = $('#newEmployeeForm').serializeArray();
    const requestBody = {
        firstName: formData[0].value,
        lastName: formData[1].value,
        street: formData[2].value,
        postCode: formData[3].value,
        city: formData[4].value,
        department: formData[5].value,
        contractId: formData[6].value
    };
    const requestOptions = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
    };

    fetch('http://localhost:8080/api/employees', requestOptions)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            return Promise.reject(response);
        })
        .then(newEmployee => {
            console.log(newEmployee)
            createRecord(newEmployee);
            window.location.reload();
        })
        .catch(error => {
            console.log('error', error);
            document.getElementById('newEmployeeError').textContent = 'Błędne dane pracownika!';
        });
});

// Delete employee
function deleteEmployee(employeeId) {
    const requestOptions = {
        method: 'DELETE',
        headers: headers,
    };

    fetch(`http://localhost:8080/api/employees/${employeeId}`, requestOptions)
        .then(response => {
            if (response.ok) {
                window.location.reload();
            } else {
                return Promise.reject(response);
            }
        })
        .catch(error => {
            console.log('error', error)
            document.getElementById('deleteEmployeeError').textContent = 'Coś poszło nie tak...';
        });
}

// Helpers
function createEmployeeDetailsTemplate(employee) {
    const employeeDetailsTemplate = `
        <div style='overflow:hidden;'>
            <div class='servicetitle' style='text-align:center;'>
                <h4>${employee.firstName} ${employee.lastName}</h4>
                <hr>
            </div>
            <div class='icn-main-container'>
                <p class='centered'>
                    <a href='index.html'><img src='img/ui-sam.jpg' class='img-circle' width='80'></a>
                </p>
            </div>
            <div style='margin: 20px 30px 0px 30px;'>
                <div class='group-rom'>
                    <div class='first-part odd' style='background:none;'>Imię</div>
                    <div class='second-part'>${employee.firstName}</div>
                </div>
                <div class='group-rom'>
                    <div class='first-part odd' style='background:none;'>Nazwisko</div>
                    <div class='second-part'>${employee.lastName}</div>
                </div>
                <div class='group-rom'>
                    <div class='first-part odd' style='background:none;'>Adres</div>
                    <div class='second-part'>${employee.street}, ${employee.postCode} ${employee.city}</div>
                </div>
                <div class='group-rom'>
                    <div class='first-part odd' style='background:none;'>Dział</div>
                    <div class='second-part'>${employee.department}</div>
                </div>
                <div class='group-rom'>
                    <div class='first-part odd' style='background:none;'>Numer umowy</div>
                    <div class='second-part'>${employee.contractId}</div>
                </div>
            </div>
        </div>`;
    return employeeDetailsTemplate.trim();
}

function createRecord(employee) {
    const login = `${employee.firstName[0].toLowerCase()}${employee.lastName.toLowerCase()}${employee.contractId.toLowerCase().substring(employee.contractId.length - 3)}`;
    const employeeRecordTemplate = `
        <tr id='employeeId${employee.id}'>
            <td>
                <a class='employeeDetails' data-toggle='modal' data-target='#employeeDetailsModal' style='cursor:pointer;'>
                    ${employee.firstName} ${employee.lastName}
                </a>
            </td>
            <td class='hidden-phone'>
                ${login}
            </td>
            <td>
                <label class='label label-success btn-xs'>aktywny</span>
            </td>
            <td>
                <button class='deleteEmployeeButton btn btn-danger btn-xs' data-toggle='modal' data-target='#deleteEmployeeModal'>
                    - usuń
                </button>
            </td>
        </tr>`;
    return employeeRecordTemplate.trim();
}
