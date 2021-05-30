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
    .then(response => {
        if(response.ok) document.location.replace('../../user_page/index.html');
        else if (response.status === 401){
            document.getElementById('loginError').innerHTML = 'Nieprawidłowe dane logowania!';
        }
    })
    .catch(error => {
        console.log('error', error);
        document.getElementById('loginError').innerHTML = 'Coś poszło nie tak.';
    });
}