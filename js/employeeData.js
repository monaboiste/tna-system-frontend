$(() => {
    const firstname = localStorage.getItem('employeeFirstname');
    const lastname = localStorage.getItem('employeeLastname');

    $('#employeeData').text(`${firstname} ${lastname}`);
});