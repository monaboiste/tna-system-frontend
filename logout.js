document.getElementById('logoutButton').addEventListener('click', function (e) {
    e.preventDefault();
    sessionStorage.clear();
    document.location.replace('login.html');
});