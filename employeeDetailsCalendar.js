document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('employeesAttendanceRecords').addEventListener('click', function () {
        const dateLongFormat = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const calendarEl = document.getElementById('calendar');

        let calendar = new FullCalendar.Calendar(calendarEl, {
            locale: 'pl',
            firstDay: 1,
            buttonText: { today: 'bieżący' },
            initialView: 'dayGridMonth',
            showNonCurrentDates: false,
            eventClick: function (info) {
                $('#calendarModalTitle').html(info.event.start.toLocaleDateString('pl-PL', dateLongFormat));
                $('#calendarModalBody').html(details(info.event.extendedProps.enteredAt, info.event.extendedProps.leftAt, info.event.title));
                $('#calendarModal').modal();
            }
        });

        const employeeId = sessionStorage.getItem('currentReviewedEmployeeId');
        console.log(employeeId);

        fetchCalendarData(employeeId).then(attendanceRecords => {
            attendanceRecords.forEach(record => {
                timestamp = record.enteredAt.split(' ');
                calendar.addEvent({
                    display: 'background',
                    backgroundColor: '#4ecdc4',
                    id: record.id,
                    title: title(record.elapsedTimePerShiftInMinutes),
                    start: timestamp[0],
                    enteredAt: timestamp[1],
                    leftAt: record.leftAt.split(' ')[1]
                });
            });
            calendar.render();

            const { hours, mins } = calcWorkHoursInMonth(attendanceRecords, calendar);
            document.getElementById('hours').textContent = hours;
            document.getElementById('mins').textContent = mins;

            document.querySelectorAll('.fc-button-primary').forEach(button => {
                button.addEventListener('click', function () {
                    const { hours, mins } = calcWorkHoursInMonth(attendanceRecords, calendar);
                    document.getElementById('hours').textContent = hours;
                    document.getElementById('mins').textContent = mins;
                });
            });
        });
    });
});

function calcWorkHoursInMonth(attendanceRecords, calendar) {
    const month = calendar.view.currentStart.getMonth();
    let workMinsTotalInMonth = 0;
    attendanceRecords.filter(record => new Date(record.enteredAt).getMonth() == month)
        .forEach(record => workMinsTotalInMonth += record.elapsedTimePerShiftInMinutes);

    return { hours: Math.floor(workMinsTotalInMonth / 60), mins: workMinsTotalInMonth % 60 };
}

function fetchCalendarData(employeeId) {
    const token = localStorage.getItem('token');

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', `Basic ${token}`);

    const requestOptions = {
        method: 'GET',
        headers: headers,
    };

    return fetch(`http://localhost:8080/api/employees/${employeeId}/attendance`, requestOptions)
        .then(response => response.json())
        .then(data => Promise.resolve(data))
        .catch(error => console.log('error', error));
}

function title(elapsed) {
    const hours = Math.floor(elapsed / 60);
    const minutes = elapsed % 60;
    return hours.toString() + ':' + minutes.toString().padStart(2, '0');
}

function details(enteredAt, leftAt, workTimeElapsed) {
    const time = workTimeElapsed.split(':');
    return 'Godzina wejścia: ' + enteredAt.toString() + '<br><br>' +
        'Godzina wyjścia: ' + leftAt.toString() + '<br><br>' +
        'W danym dniu przepracowano: ' + time[0] + 'h ' + time[1] + 'min';
}
