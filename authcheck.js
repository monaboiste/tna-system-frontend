
const userRole = localStorage.getItem('userRole');
let adminOnlyElements = document.querySelectorAll('.admin');
console.log(adminOnlyElements);
if (userRole === 'ADMIN') {
    adminOnlyElements.forEach(element => {
        element.style.display = 'block';
    })
} else {
    adminOnlyElements.forEach(element => {
        element.style.display = 'none';
    })
}

const loggedIn = localStorage.getItem('loggedIn');
if (!loggedIn) {
    document.location.replace('login.html');
}
