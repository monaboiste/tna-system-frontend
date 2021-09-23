import { apiUrl } from './api.js';

$('#loginButton').click(e => {
    e.preventDefault();
    // see: login.html
    localStorage.clear();

    const username = $('#username').val();
    const password = $('#password').val();
    const b64token = btoa(`${username}:${password}`);
    let headers = new Headers();
    headers.append('Content-type', 'application/json')
    headers.append('Authorization', 'Basic ' + b64token);

    let requestOptions = {
        method: 'GET',
        headers: headers
    };

    fetch(`${apiUrl}/users/current`, requestOptions)
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            return Promise.reject(response);
        })
        .then(user => {
            if (user) {
                localStorage.setItem('token', b64token);
                localStorage.setItem('userId', user.id);
                localStorage.setItem('userRole', user.role);
                localStorage.setItem('loggedIn', true);

                return fetch(`${apiUrl}/employees/${user.id}`, requestOptions);
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            return Promise.reject(response);
        })
        .then(employee => {
            localStorage.setItem('employeeFirstname', employee.firstName);
            localStorage.setItem('employeeLastname', employee.lastName);

            document.location.replace('index.html');
        })
        .catch(err => {
            console.error(err);
            $('#loginError').text('Nieprawidłowe dane logowania!');
        });
});