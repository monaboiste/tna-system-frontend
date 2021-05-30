document.getElementById('loginButton')
.addEventListener('click', login);

function login(){
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    
    myHeaders = new Headers();
    myHeaders.append("Content-type", "application/json")
    myHeaders.append("Authorization", "Basic " + btoa(`${username}:${password}`));

    let raw = "";

    let requestOptions = {
    method: 'GET',
    headers: myHeaders,
    };

    fetch("https://tna-system.herokuapp.com/api/users", requestOptions)
    .then((response) => {
        if(response.ok){
            sessionStorage.setItem('username', username);
            sessionStorage.setItem('password', password);
        }
        else if (response.status === 401){
            document.getElementById('loginError').innerHTML = 'Nieprawidłowe dane logowania!';
        }
        return response.json();
    })
    .then((data) => {
        data.forEach((element) => {
            if(element.username == username) sessionStorage.setItem('id', element.id);
        });
        document.location.replace('../../user_page/index.html');
    })
    .catch(error => {
        console.log('error', error);
        document.getElementById('loginError').innerHTML = 'Coś poszło nie tak.';
    });
}