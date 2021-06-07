document.getElementById('loginButton').addEventListener('click', function (e) {
    e.preventDefault();
    // see: login.html
    localStorage.clear();

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
    fetch('http://localhost:8080/api/users/current', requestOptions)
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            return Promise.reject(response);
        })
        .then(function (user) {
            if (user) {
                localStorage.setItem('token', b64token);
                localStorage.setItem('userId', user.id);
                localStorage.setItem('userRole', user.role);
                localStorage.setItem('loggedIn', true);

                return fetch(`http://localhost:8080/api/employees/${user.id}`, requestOptions);
            }
        })
        .then(function (response) {
            if (response.ok) {
                return response.json();
            }
            return Promise.reject(response);
        })
        .then(function (employee) {
            localStorage.setItem('employeeFirstname', employee.firstName);
            localStorage.setItem('employeeLastname', employee.lastName);

            document.location.replace('index.html');
        })
        .catch(error => {
            console.log('error', error);
            document.getElementById('loginError').textContent = 'Nieprawidłowe dane logowania!';
        });
});