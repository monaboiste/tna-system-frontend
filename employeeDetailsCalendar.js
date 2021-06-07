// TODO Fix update entry/exit date issue (reformat)
// Calender fetches remebered events

// Auth token and headers already declared

let employeeCalendar;

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('employeesAttendanceRecords').addEventListener('click', function () {
        const dateLongFormat = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const calendarEl = document.getElementById('calendar');

        employeeCalendar = new FullCalendar.Calendar(calendarEl, {
            locale: 'pl',
            firstDay: 1,
            buttonText: { today: 'bieżący' },
            initialView: 'dayGridMonth',
            showNonCurrentDates: false,
            editable: true,
            selectable: true,
            selectOverlap: false,
            eventClick: function (info) {
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

                $('#calendarModalTitle').html(info.event.start.toLocaleDateString('pl-PL', dateLongFormat));
                $('#calendarModal').modal();
            },
            select: function (info) {
                // New attendance record
                // Make a deep copy
                const dateCopy = new Date(info.start);
                resetState(info.start, dateCopy, 0);
                // Toggle
                $('#newAttendanceRecord').show();
                $('#editAttendanceRecord').hide();

                $('#calendarModalTitle').html(info.start.toLocaleDateString('pl-PL', dateLongFormat));
                $('#calendarModal').modal();
            },
        });

        const employeeId = sessionStorage.getItem('currentReviewedEmployeeId');

        fetchCalendarData(employeeId).then(attendanceRecords => {
            console.log(attendanceRecords);
            attendanceRecords.forEach(record => {
                employeeCalendar.addEvent({
                    display: 'background',
                    backgroundColor: '#4ecdc4',
                    id: record.id,
                    title: title(record.elapsedTimePerShiftInMinutes),
                    start: record.enteredAt.split(' ')[0],
                    enteredAt: record.enteredAt,
                    leftAt: record.leftAt
                });
            });
            employeeCalendar.render();

            const { hours, mins } = calcWorkHoursInMonth(attendanceRecords, employeeCalendar);
            document.getElementById('hours').textContent = hours;
            document.getElementById('mins').textContent = mins;

            document.querySelectorAll('.fc-button-primary').forEach(button => {
                button.addEventListener('click', function () {
                    const { hours, mins } = calcWorkHoursInMonth(attendanceRecords, employeeCalendar);
                    document.getElementById('hours').textContent = hours;
                    document.getElementById('mins').textContent = mins;
                });
            });
        });

    });
    setupTimepicker();

    document.getElementById('newAttendanceRecord').addEventListener('click', function () {
        const employeeId = sessionStorage.getItem('currentReviewedEmployeeId');

        const requestBody = {
            employeeId: employeeId,
            enteredAt: $('#entryTimePicker').val() + ':00',
            leftAt: $('#exitTimePicker').val() + ':00'
        };
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

        fetch('http://localhost:8080/api/attendance', requestOptions)
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                return Promise.reject(response);
            })
            .then(record => {
                console.log(record);

                employeeCalendar.addEvent({
                    display: 'background',
                    backgroundColor: '#4ecdc4',
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
            .catch(error => {
                console.log('error', error);
                $(alertDiv).html(createAlertTemplate(false));
            });
    });

    document.getElementById('editAttendanceRecord').addEventListener('click', function () {
        const employeeId = sessionStorage.getItem('currentReviewedEmployeeId');

        const requestEntryTimeBody = {
            enteredAt: $('#entryTimePicker').val() + ':00'
        };
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

        updateEnteredAtAttendanceRecord(employeeId, attendanceId, requestEntryTimeOptions).then(_ => {
            updateLeftAtAttendanceRecord(employeeId, attendanceId, requestExitTimeOptions).then(record => {
                // Update event
                let event = employeeCalendar.getEventById(attendanceId);
                const oldElapsedTime = event.title;

                event.setStart(record.enteredAt.split(' ')[0]);
                event.setExtendedProp('enteredAt', record.enteredAt);
                event.setExtendedProp('leftAt', record.leftAt);
                event.setProp('title', title(record.elapsedTimePerShiftInMinutes));

                $(alertDiv).html(createAlertTemplate(true));
                employeeCalendar.refetchEvents();

                recalculateTotalWorkingHours(record.elapsedTimePerShiftInMinutes, oldElapsedTime);
            });
        });
    });
});

function updateEnteredAtAttendanceRecord(employeeId, attendanceId, requestOptions) {
    return fetch(`http://localhost:8080/api/employees/${employeeId}/attendance/${attendanceId}/entry-time`, requestOptions)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            return Promise.reject(response);
        })
        .then(enteredAt => {
            console.log('Updated: ' + enteredAt);
            return Promise.resolve(enteredAt)
        })
        .catch(error => {
            console.log('error', error);
            $(alertDiv).html(createAlertTemplate(false));
        });
}

function updateLeftAtAttendanceRecord(employeeId, attendanceId, requestOptions) {
    return fetch(`http://localhost:8080/api/employees/${employeeId}/attendance/${attendanceId}/exit-time`, requestOptions)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            return Promise.reject(response);
        })
        .then(leftAt => {
            console.log('Updated: ' + leftAt);
            return Promise.resolve(leftAt)
        })
        .catch(error => {
            console.log('error', error);
            $(alertDiv).html(createAlertTemplate(false));
        });
}

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

function details(elapsed) {
    const hours = Math.floor(elapsed / 60);
    const minutes = elapsed % 60;
    return hours.toString() + 'h ' + minutes.toString().padStart(2, '0') + 'min';
}

function resetState(startDate, endDate, diffMins) {
    $('#editWorkHours').html(details(diffMins));
    $(alertDiv).html('');

    $('#entryTimePicker').datetimepicker('setOptions', { defaultDate: startDate, value: startDate });
    $('#exitTimePicker').datetimepicker('setOptions', { defaultDate: endDate, value: endDate });
}

function setupTimepicker() {
    $.datetimepicker.setLocale('pl');
    $('#entryTimePicker').datetimepicker({
        format: 'Y-m-d H:i',
        onChangeDateTime: onDateChange
    });
    $('#entryTimePickerOpen').click(function () {
        $('#entryTimePicker').datetimepicker('show');
    });

    $('#exitTimePicker').datetimepicker({
        format: 'Y-m-d H:i',
        onChangeDateTime: onDateChange
    });
    $('#exitTimePickerOpen').click(function () {
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