import { apiUrl } from './api.js';

$(() => {
    const dateLongFormat = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };
    const calendarEl = $('#calendar')[0];

    let calendar = new FullCalendar.Calendar(calendarEl, {
        height: 1000,
        locale: 'pl',
        firstDay: 1,
        buttonText: { today: 'bieżący' },
        initialView: 'dayGridMonth',
        showNonCurrentDates: false,
        eventClick: info => {
            $('#modalTitle').html(
                info.event.start.toLocaleDateString('pl-PL', dateLongFormat)
            );
            $('#modalBody').html(
                details(
                    info.event.extendedProps.enteredAt,
                    info.event.extendedProps.leftAt,
                    info.event.title
                )
            );
            $('#calendarModal').modal();
        }
    });

    fetchAttendanceForEmployee()
        .then(attendanceRecords => {
            attendanceRecords.forEach(record => {
                const timestamp = record.enteredAt.split(' ');
                calendar.addEvent({
                    display: 'background',
                    backgroundColor: '#4ecdc4a8',
                    id: record.id,
                    title: title(record.elapsedTimePerShiftInMinutes),
                    start: timestamp[0],
                    enteredAt: timestamp[1],
                    leftAt: record.leftAt.split(' ')[1]
                });
            });

            calendar.render();

            const { hours, mins } = calcWorkHoursInMonth(attendanceRecords, calendar);
            $('#hours').text(hours);
            $('#mins').text(mins);

            $('.fc-button-primary').click(() => {
                const { hours, mins } = calcWorkHoursInMonth(attendanceRecords, calendar);
                $('#hours').text(hours);
                $('#mins').text(mins);
            });
        });
});

function calcWorkHoursInMonth(attendanceRecords, calendar) {
    const month = calendar.view.currentStart.getMonth();
    let workMinsTotalInMonth = 0;
    attendanceRecords.filter(record =>
        new Date(record.enteredAt).getMonth() == month
    )
    .forEach(record =>
        workMinsTotalInMonth += record.elapsedTimePerShiftInMinutes
    );

    return {
        hours: Math.floor(workMinsTotalInMonth / 60),
        mins: workMinsTotalInMonth % 60
    };
}

async function fetchAttendanceForEmployee() {
    const employeeId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', `Basic ${token}`);

    const requestOptions = {
        method: 'GET',
        headers: headers,
    };

    try {
        const response = await fetch(`${apiUrl}/employees/${employeeId}/attendance`, requestOptions)
        return response.json();
    } catch (err) {
        console.error(err);
    }
}

function title(elapsedWorkTime) {
    const hours = Math.floor(elapsedWorkTime / 60);
    const minutes = elapsedWorkTime % 60;
    return `${hours.toString()}:${minutes.toString().padStart(2, '0')}`;
}

function details(enteredAt, leftAt, elapsedWorkTime) {
    const [hours, mins] = elapsedWorkTime.split(':');
    return `
        Godzina wejścia: ${enteredAt.toString()}<br><br>
        Godzina wyjścia: ${leftAt.toString()}<br><br>
        W danym dniu przepracowano: ${hours}h ${mins}min
    `;
}
