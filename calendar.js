window.onload = function(){ 
    checkForAdmin();
}

function checkForAdmin(){
    const role = localStorage.getItem('role');

    if(role === 'ADMIN') {
        document.getElementById('adminMenu').innerHTML = 
        `
        <a class='inactive' href='employees.html'>
                <i class='fa fa-users'></i>
                <span>Pracownicy</span>
        </a>
        `
    }
}

function title(elapsed) {
    const hours = Math.floor(elapsed / 60);
    const minutes = elapsed % 60;
    return hours.toString() + ':' + minutes.toString().padStart(2, '0');
}

function details(enteredAt, leftAt) {
    return 'Godzina wejścia: ' + enteredAt.toString() + '<br><br>' +
        'Godzina wyjścia: ' + leftAt.toString();
}
const dateLongFormat = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');

    let calendar = new FullCalendar.Calendar(calendarEl, {
        locale: 'pl',
        firstDay: 1,
        buttonText: { today: 'bieżący' },
        initialView: 'dayGridMonth',
        showNonCurrentDates: false,
        eventClick: function (info) {
            $('#modalTitle').html(info.event.start.toLocaleDateString('pl-PL', dateLongFormat));
            $('#modalBody').html(details(info.event.extendedProps.enteredAt, info.event.extendedProps.leftAt));
            $('#calendarModal').modal();
        }
    });

    calendar.render();
    $(document).ready(function () {
        window.foo = calendar.view;
    });

    fetchCalendarData().then(attendanceRecords => {
        console.log(attendanceRecords);

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

function calcWorkHoursInMonth(attendanceRecords, calendar) {
    const month = calendar.view.currentStart.getMonth();
    let workMinsTotalInMonth = 0;
    attendanceRecords.filter(record => new Date(record.enteredAt).getMonth() == month)
        .forEach(record => workMinsTotalInMonth += record.elapsedTimePerShiftInMinutes);

    return { hours: Math.floor(workMinsTotalInMonth / 60), mins: workMinsTotalInMonth % 60 };
}

function fetchCalendarData() {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', `Basic ${token}`);

    const requestOptions = {
        method: 'GET',
        headers: headers,
    };

    return fetch(`http://localhost:8080/api/employees/${userId}/attendance`, requestOptions)
        .then(response => response.json())
        .then(data => Promise.resolve(data))
        .catch(error => console.log('error', error));
}
