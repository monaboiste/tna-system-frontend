$('#logoutButton').click(e => {
    e.preventDefault();
    localStorage.clear();
    document.location.replace('login.html');
});