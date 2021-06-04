// document.addEventListener('DOMContentLoaded', function () {
//     const firstname = localStorage.getItem('employeeFirstname');
//     const lastname = localStorage.getItem('employeeLastname');

//     document.getElementById('employeeData').textContent = firstname + ' ' + lastname;
// });
// I'm not sure whether it should stay here so I'm just leaving it commented out - J.Wilk

window.onload = function(){ 
    checkForAdmin();
    fillEmployeeData(); 
}

function checkForAdmin(){
    const role = localStorage.getItem('role');

    if(role === 'ADMIN') {
        document.getElementById('adminMenu').innerHTML = 
        `
        <a class='inactive' href='employees.html'>
                <i class='fa fa-users'></i>
                <span>Pracownicy</span>
        </a>
        `
    }
}

function fillEmployeeData(){
    const userToken = localStorage.getItem('token');
    const userId = localStorage.getItem('userId')
    const baseUrl = `http://localhost:8080/api/employees/${userId}`
    empHeaders = new Headers();
    empHeaders.append("Content-Type", "application/json");
    empHeaders.append("Authorization", `Basic ${userToken}`);

    let requestOptions = {
        method: 'GET',
        headers: empHeaders
    };

    fetch(baseUrl, requestOptions)
    .then((response) => {
        if(response.ok) return response.json();
        else document.getElementById('empErrorMsg').innerHTML
                                 = "Błąd połączenia z serwerem";
    })
    .then((data) => {
        document.getElementById('empName').innerHTML = `<b>Imię: </b>${data.firstName}`
        document.getElementById('empLastName').innerHTML = `<b>Nazwisko: </b>${data.lastName}`
        document.getElementById('empDepartment').innerHTML = `<b>Dział: </b>${data.department}`
        document.getElementById('empContract').innerHTML = `<b>Nr umowy: </b>${data.contractId}`
        document.getElementById('empStreet').innerHTML = `<b>Ulica: </b>${data.street}`
        document.getElementById('empPostCode').innerHTML = `<b>Kod pocztowy: </b>${data.postCode}`
        document.getElementById('empCity').innerHTML = `<b>Miasto: </b>${data.city}`
    });
}