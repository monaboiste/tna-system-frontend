const loggedIn = sessionStorage.getItem('loggedIn');
if (!loggedIn) {
    document.location.replace('login.html');
}