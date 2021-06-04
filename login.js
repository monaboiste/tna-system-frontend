if(localStorage.getItem('loggedIn') === 'true') document.location.replace('index.html');
    else localStorage.clear();

document.getElementById('loginButton').addEventListener('click', function (e) {
    e.preventDefault();
    // see: login.html

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
    // const baseUrl = 'https://tna-system.herokuapp.com';
    const baseUrl = 'http://localhost:8080';
    fetch(baseUrl + '/api/users/current', requestOptions)
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
                localStorage.setItem('token', b64token);
                localStorage.setItem('userId', data.id);
                localStorage.setItem('loggedIn', true);
                localStorage.setItem('role', data.role);

                return fetch(`${baseUrl}/api/employees/${data.id}`, requestOptions);
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
            localStorage.setItem('employeeFirstname', data.firstName);
            localStorage.setItem('employeeLastname', data.lastName);

            document.location.replace('index.html');
        })
        .catch(error => {
            console.log('error', error);
            document.getElementById('loginError').textContent = 'Coś poszło nie tak.';
        });
});