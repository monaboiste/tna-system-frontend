document.getElementById('logoutButton').addEventListener('click', function (e) {
    e.preventDefault();
    localStorage.clear();
    document.location.replace('login.html');
});