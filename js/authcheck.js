const loggedIn = localStorage.getItem('loggedIn');
if (!loggedIn) {
    document.location.replace('login.html');
}

$(() => {
    const userRole = localStorage.getItem('userRole');
    let adminOnlyElements = $('.admin');
    if (userRole === 'ADMIN') {
        adminOnlyElements.show();
    }
});