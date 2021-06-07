const loggedIn = localStorage.getItem('loggedIn');
if (!loggedIn) {
    document.location.replace('login.html');
}

document.addEventListener('DOMContentLoaded', function () {
    const userRole = localStorage.getItem('userRole');
    let adminOnlyElements = document.querySelectorAll('.admin');
    if (userRole === 'ADMIN') {
        adminOnlyElements.forEach(element => {
            element.style.display = 'block';
        });
    }
});