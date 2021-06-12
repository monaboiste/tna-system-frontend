document.addEventListener('DOMContentLoaded', function () {
    const firstname = localStorage.getItem('employeeFirstname');
    const lastname = localStorage.getItem('employeeLastname');

    document.getElementById('employeeData').textContent = firstname + ' ' + lastname;
});