document.addEventListener('DOMContentLoaded', function () {
    const firstname = sessionStorage.getItem('employeeFirstname');
    const lastname = sessionStorage.getItem('employeeLastname');

    document.getElementById('employeeData').textContent = firstname + ' ' + lastname;
});