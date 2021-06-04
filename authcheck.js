const loggedIn = localStorage.getItem('loggedIn');
if (!loggedIn) {
    document.location.replace('login.html');
}