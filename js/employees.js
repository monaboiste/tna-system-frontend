import { apiUrl } from "./api.js";

const token = localStorage.getItem('token');

const headers = new Headers();
headers.append('Content-Type', 'application/json');
headers.append('Authorization', `Basic ${token}`);

// Fetch all employees
$(() => {
    const requestOptions = {
        method: 'GET',
        headers: headers,
    };

    fetch(`${apiUrl}/employees`, requestOptions)
        .then(response => response.json())
        .then(async employees => {
            const employeesWithRoles = await mapUserRoleToEmployee(employees);

            employeesWithRoles.sort((lhs, rhs) => {
                if (lhs.lastName < rhs.lastName) {
                    return -1;
                }
                if (lhs.lastName > rhs.lastName) {
                    return 1;
                }
                return 0;
            });

            let employeeTable = $('#employeeTable');
            let combinedTemplate = '';
            employeesWithRoles.forEach(employee => combinedTemplate += createRecord(employee))
            employeeTable.html(combinedTemplate);

            // Delete employee
            $('.deleteEmployeeButton').click(e => {
                $('#deleteEmployeeError').text('');
                $('#deleteEmployeeName').text(e.target.parentElement.parentElement.children[0].innerText);

                const userId = e.target.parentElement.parentElement.id.split('employeeId')[1];

                $('#deleteEmployeeRequest').click(() => deleteEmployee(userId));
            });

            $('.employeeDetails').click(e => {
                const employeeId = e.target.parentElement.parentElement.id.split('employeeId')[1];
                // Store for calendar
                sessionStorage.setItem('currentReviewedEmployeeId', employeeId);

                fetch(`${apiUrl}/employees/${employeeId}`, requestOptions)
                    .then(response => response.json())
                    .then(employee =>
                        $('#employeeDetailsModalBody').html(createEmployeeDetailsTemplate(employee))
                    )
                    .catch(err => console.error(err));
            });
        })
        .catch(err => console.error(err));
});

// New employee
$('#newEmployeeButton').click(() => $('#newEmployeeError').text(''));

$('#newEmployeeRequest').click(() => {
    const formData = $('#newEmployeeForm').serializeArray();
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

    fetch(`${apiUrl}/employees`, requestOptions)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            return Promise.reject(response);
        })
        .then(newEmployee => {
            createRecord(newEmployee);
            window.location.reload();
        })
        .catch(err => {
            console.error(err);
            $('#newEmployeeError').text('Błędne dane pracownika!');
        });
});

// Delete employee
function deleteEmployee(employeeId) {
    const requestOptions = {
        method: 'DELETE',
        headers: headers,
    };

    fetch(`${apiUrl}/employees/${employeeId}`, requestOptions)
        .then(response => {
            if (response.ok) {
                window.location.reload();
            } else {
                return Promise.reject(response);
            }
        })
        .catch(err => {
            console.error(err)
            $('#deleteEmployeeError').text('Coś poszło nie tak...');
        });
}

// Helpers
function createEmployeeDetailsTemplate(employee) {
    const employeeDetailsTemplate = `
        <div style='overflow:hidden;'>
            <div class='servicetitle' style='text-align:center;'>
                <h4>${employee.lastName} ${employee.firstName}</h4>
                <hr>
            </div>
            <div class='icn-main-container'>
                <p class='centered'>
                    <a><img src='img/ui-sam.jpg' class='img-circle' width='80'></a>
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
    const label = (employee.role === "ADMIN") ? 'label-warning' : 'label-default';
    const employeeRecordTemplate = `
        <tr id='employeeId${employee.id}'>
            <td>
                <a class='employeeDetails' data-toggle='modal' data-target='#employeeDetailsModal' style='cursor:pointer;'>
                    ${employee.lastName} ${employee.firstName}
                </a>
            </td>
            <td class='hidden-phone'>
                ${employee.username}
            </td>
            <td>
                <label class='label ${label} btn-xs'>${employee.role}</span>
            </td>
            <td>
                <button class='deleteEmployeeButton btn btn-danger btn-xs' data-toggle='modal' data-target='#deleteEmployeeModal'>
                    - usuń
                </button>
            </td>
        </tr>`;
    return employeeRecordTemplate.trim();
}

async function mapUserRoleToEmployee(employees) {
    const requestOptions = {
        method: 'GET',
        headers: headers,
    };

    const users = await fetch(`${apiUrl}/users`, requestOptions)
        .then(response => response.json())
        .then(users => {
            return users.map((user, i) => {
                const emp = employees[i];
                if (emp && user.id == emp.id) {
                    return Object.assign({}, user, emp)
                }
            })
            .filter(emp => emp);
        })
        .catch(err => console.error(err));

    return users;
}
