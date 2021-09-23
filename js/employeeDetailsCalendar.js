import { apiUrl } from './api.js';

let employeeCalendar;

$(() => {
    $('#employeesAttendanceRecords').click(() => {
        const dateLongFormat = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const calendarEl = $('#calendar')[0];

        employeeCalendar = new FullCalendar.Calendar(calendarEl, {
            locale: 'pl',
            firstDay: 1,
            buttonText: { today: 'bieżący' },
            initialView: 'dayGridMonth',
            showNonCurrentDates: false,
            editable: true,
            selectable: true,
            selectOverlap: false,
            eventClick: info => {
                // Edit attendance record
                // Temporary store attendanceId in case if updated
                sessionStorage.setItem('currentReviewedAttendanceId', info.event.id);

                const entryTime = new Date(info.event.extendedProps.enteredAt);
                const exitTime = new Date(info.event.extendedProps.leftAt);
                const diffMins = Math.floor((exitTime - entryTime) / 1000 / 60);
                resetState(entryTime, exitTime, diffMins);
                // Toggle
                $('#newAttendanceRecord').hide();
                $('#editAttendanceRecord').show();

                $('#calendarModalTitle').html(
                    info.event.start.toLocaleDateString('pl-PL', dateLongFormat)
                );
                $('#calendarModal').modal();
            },
            select: info => {
                // New attendance record
                // Make a deep copy
                const dateCopy = new Date(info.start);
                resetState(info.start, dateCopy, 0);
                // Toggle
                $('#newAttendanceRecord').show();
                $('#editAttendanceRecord').hide();

                $('#calendarModalTitle').html(
                    info.start.toLocaleDateString('pl-PL', dateLongFormat)
                );
                $('#calendarModal').modal();
            },
        });

        const employeeId = sessionStorage.getItem('currentReviewedEmployeeId');

        timeout(200).then(() => {
            fetchAttendanceForEmployee(employeeId)
                .then(attendanceRecords => {
                    attendanceRecords.forEach(record => {
                        employeeCalendar.addEvent({
                            display: 'background',
                            backgroundColor: '#4ecdc4a8',
                            id: record.id,
                            title: title(record.elapsedTimePerShiftInMinutes),
                            start: record.enteredAt.split(' ')[0],
                            enteredAt: record.enteredAt,
                            leftAt: record.leftAt
                        });
                    });

                    const { hours, mins }
                        = calcWorkHoursInMonth(attendanceRecords, employeeCalendar);
                    $('#hours').text(hours);
                    $('#mins').text(mins);

                    $('.fc-button-primary').click(() => {
                        const { hours, mins }
                            = calcWorkHoursInMonth(attendanceRecords, employeeCalendar);
                        $('#hours').text(hours);
                        $('#mins').text(mins);
                    });
                });
            employeeCalendar.render();
        });
    });
    setupTimepicker();

    $('#newAttendanceRecord').click(() => {
        const employeeId = sessionStorage.getItem('currentReviewedEmployeeId');

        const requestBody = {
            employeeId: employeeId,
            enteredAt: $('#entryTimePicker').val() + ':00',
            leftAt: $('#exitTimePicker').val() + ':00'
        };

        const token = localStorage.getItem('token');
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', `Basic ${token}`);

        const requestOptions = {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        };
        // Don't allow negative hours
        if (requestBody.enteredAt > requestBody.leftAt) {
            $(alertDiv).html(createAlertTemplate(false));
            throw new Error('Working hours cannot be nagetive!');
        }

        fetch(`${apiUrl}/attendance`, requestOptions)
            .then(response => response.json())
            .then(record => {
                employeeCalendar.addEvent({
                    display: 'background',
                    backgroundColor: '#4ecdc4a8',
                    id: record.id,
                    title: title(record.elapsedTimePerShiftInMinutes),
                    start: record.enteredAt.split(' ')[0],
                    enteredAt: record.enteredAt,
                    leftAt: record.leftAt
                });
                $(alertDiv).html(createAlertTemplate(true));
                $('#newAttendanceRecord').hide();
                $('#editAttendanceRecord').show();

                // Temporary store attendanceId in case if updated
                sessionStorage.setItem('currentReviewedAttendanceId', record.id);

                employeeCalendar.refetchEvents();

                recalculateTotalWorkingHours(record.elapsedTimePerShiftInMinutes, '00:00');
            })
            .catch(err => {
                console.error(err);
                $(alertDiv).html(createAlertTemplate(false));
            });
    });

    $('#editAttendanceRecord').click(() => {
        const employeeId = sessionStorage.getItem('currentReviewedEmployeeId');

        const requestEntryTimeBody = {
            enteredAt: $('#entryTimePicker').val() + ':00'
        };

        const token = localStorage.getItem('token');
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', `Basic ${token}`);

        const requestEntryTimeOptions = {
            method: 'PATCH',
            headers: headers,
            body: JSON.stringify(requestEntryTimeBody)
        };
        const requestExitTimeBody = {
            leftAt: $('#exitTimePicker').val() + ':00'
        };
        const requestExitTimeOptions = {
            method: 'PATCH',
            headers: headers,
            body: JSON.stringify(requestExitTimeBody)
        };
        const attendanceId = sessionStorage.getItem('currentReviewedAttendanceId');
        // Don't allow negative hours
        if (requestEntryTimeBody.enteredAt > requestExitTimeBody.leftAt) {
            $(alertDiv).html(createAlertTemplate(false));
            throw new Error('Working hours cannot be nagetive!');
        }

        updateEnteredAtAttendanceRecord(employeeId, attendanceId, requestEntryTimeOptions)
            .then(() => {
                updateLeftAtAttendanceRecord(employeeId, attendanceId, requestExitTimeOptions)
                    .then(record => {
                        // Update event
                        let event = employeeCalendar.getEventById(attendanceId);
                        const oldElapsedTime = event.title;

                        event.setStart(record.enteredAt.split(' ')[0]);
                        event.setExtendedProp('enteredAt', record.enteredAt);
                        event.setExtendedProp('leftAt', record.leftAt);
                        event.setProp('title', title(record.elapsedTimePerShiftInMinutes));

                        $(alertDiv).html(createAlertTemplate(true));
                        employeeCalendar.refetchEvents();

                        recalculateTotalWorkingHours(
                            record.elapsedTimePerShiftInMinutes,
                            oldElapsedTime
                        );
                    });
            });
    });
});

async function updateEnteredAtAttendanceRecord(employeeId, attendanceId, requestOptions) {
    return fetch(`${apiUrl}/employees/${employeeId}/attendance/${attendanceId}/entry-time`, requestOptions)
        .then(response => response.json())
        .catch(err => {
            console.error(err);
            $(alertDiv).html(createAlertTemplate(false));
        });
}

async function updateLeftAtAttendanceRecord(employeeId, attendanceId, requestOptions) {
    return fetch(`${apiUrl}/employees/${employeeId}/attendance/${attendanceId}/exit-time`, requestOptions)
        .then(response => response.json())
        .catch(err => {
            console.error(err);
            $(alertDiv).html(createAlertTemplate(false));
        });
}

function calcWorkHoursInMonth(attendanceRecords, calendar) {
    const month = calendar.view.currentStart.getMonth();
    let workMinsTotalInMonth = 0;
    attendanceRecords.filter(record => new Date(record.enteredAt).getMonth() == month)
        .forEach(record => workMinsTotalInMonth += record.elapsedTimePerShiftInMinutes);

    return {
        hours: Math.floor(workMinsTotalInMonth / 60),
        mins: workMinsTotalInMonth % 60
    };
}

async function fetchAttendanceForEmployee(employeeId) {
    const token = localStorage.getItem('token');

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', `Basic ${token}`);

    const requestOptions = {
        method: 'GET',
        headers: headers,
    };

    return fetch(`${apiUrl}/employees/${employeeId}/attendance`, requestOptions)
        .then(response => response.json())
        .catch(err => console.error(err));
}

function title(elapsedWorkTime) {
    const hours = Math.floor(elapsedWorkTime / 60);
    const minutes = elapsedWorkTime % 60;
    return `${hours.toString()}:${minutes.toString().padStart(2, '0')}`;
}

function details(elapsedWorkTime) {
    const hours = Math.floor(elapsedWorkTime / 60);
    const minutes = elapsedWorkTime % 60;
    return `${hours.toString()}h ${minutes.toString().padStart(2, '0')}min`;
}

function resetState(startDate, endDate, diffMins) {
    $('#editWorkHours').html(details(diffMins));
    $(alertDiv).html('');

    $('#entryTimePicker').datetimepicker(
        'setOptions',
        { defaultDate: startDate, value: startDate }
    );
    $('#exitTimePicker').datetimepicker(
        'setOptions',
        { defaultDate: endDate, value: endDate }
    );
}

function setupTimepicker() {
    $.datetimepicker.setLocale('pl');
    $('#entryTimePicker').datetimepicker({
        format: 'Y-m-d H:i',
        onChangeDateTime: onDateChange
    });
    $('#entryTimePickerOpen').click(() => {
        $('#entryTimePicker').datetimepicker('show');
    });

    $('#exitTimePicker').datetimepicker({
        format: 'Y-m-d H:i',
        onChangeDateTime: onDateChange
    });
    $('#exitTimePickerOpen').click(() => {
        $('#exitTimePicker').datetimepicker('show');
    });
}

function onDateChange() {
    const entryTime = $('#entryTimePicker').datetimepicker('getValue');
    const exitTime = $('#exitTimePicker').datetimepicker('getValue');
    let diffMins = Math.floor((exitTime - entryTime) / 1000 / 60);

    // Don't allow negative hours and set to 0 when buffer overflow occurred
    if (diffMins < 0 || diffMins > 2000) {
        diffMins = 0;
    }

    $('#editWorkHours').html(details(diffMins));
}

function createAlertTemplate(success) {
    const alertSuccess = success ? 'alert-success' : 'alert-danger';
    const alertTitle = success ? 'Zatwierdzono!' : 'Niepowodzenie!';
    const alertDescription = success ? 'Zmiany zostały pomyślnie wprowadzone' : 'Wprowadzono złe dane'
    const alertTemplate =
        `<div>
            <div class='alert ${alertSuccess} alert-dismissable' style='margin-bottom: 80px;'>
              <button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>
              <strong>${alertTitle}</strong> ${alertDescription}.
        </div>`;
    return alertTemplate.trim();
}

function recalculateTotalWorkingHours(minsToAdd, oldElapsedTime) {
    const oldHoursMins = oldElapsedTime.split(':');

    const hours = parseInt($('#hours').text(), 10) - parseInt(oldHoursMins[0], 10);
    const mins = parseInt($('#mins').text(), 10) - parseInt(oldHoursMins[1], 10);
    const totalWorkMins = hours * 60 + mins + minsToAdd;
    $('#hours').html(Math.floor(totalWorkMins / 60));
    $('#mins').html(totalWorkMins % 60);
}

async function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
