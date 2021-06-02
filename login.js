document.getElementById('loginButton').addEventListener('click', function (e) {
    e.preventDefault();
    // see: login.html

    sessionStorage.clear();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const b64token = btoa(`${username}:${password}`);
    let headers = new Headers();
    headers.append('Content-type', 'application/json')
    headers.append('Authorization', 'Basic ' + b64token);

    let requestOptions = {
        method: 'GET',
        headers: headers
    };
    const baseUrl = 'https://tna-system.herokuapp.com';
    fetch('http://localhost:8080/api/users/current', requestOptions)
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                document.getElementById('loginError').textContent = 'Nieprawidłowe dane logowania!';
                return Promise.reject(response);
            }
        })
        .then(function (data) {
            if (data) {
                sessionStorage.setItem('token', b64token);
                sessionStorage.setItem('userId', data.id);
                sessionStorage.setItem('loggedIn', true);

                return fetch(`http://localhost:8080/api/employees/${data.id}`, requestOptions);
            }
        })
        .then(function (response) {
            if (response.ok) {
                return response.json();
            } else {
                return Promise.reject(response);
            }
        })
        .then(function (data) {
            sessionStorage.setItem('employeeFirstname', data.firstName);
            sessionStorage.setItem('employeeLastname', data.lastName);

            document.location.replace('index.html');
        })
        .catch(error => {
            console.log('error', error);
            document.getElementById('loginError').textContent = 'Coś poszło nie tak.';
        });
});