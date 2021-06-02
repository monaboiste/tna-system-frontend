var Script = function () {


    /* initialize the external events
     -----------------------------------------------------------------*/

    $('#external-events div.external-event').each(function () {

        // create an Event Object (http://arshaw.com/fullcalendar/docs/event_data/Event_Object/)
        // it doesn't need to have a start or end
        var eventObject = {
            title: $.trim($(this).text()) // use the element's text as the event title
        };

        // store the Event Object in the DOM element so we can get to it later
        $(this).data('eventObject', eventObject);

        // make the event draggable using jQuery UI
        $(this).draggable({
            zIndex: 999,
            revert: true,      // will cause the event to go back to its
            revertDuration: 0  //  original position after the drag
        });

    });


    /* initialize the calendar
     -----------------------------------------------------------------*/
    var attendanceRecords = [
            {
                "id": 202,
                "employeeId": 2,
                "shiftId": 1,
                "enteredAt": "2021-05-03 05:58:02",
                "leftAt": "2021-05-03 14:00:00",
                "elapsedTimePerShiftInMinutes": 481
            },
            {
                "id": 214,
                "employeeId": 2,
                "shiftId": 1,
                "enteredAt": "2021-05-04 05:58:02",
                "leftAt": "2021-05-04 14:00:00",
                "elapsedTimePerShiftInMinutes": 481
            },
            {
                "id": 227,
                "employeeId": 2,
                "shiftId": 1,
                "enteredAt": "2021-05-05 05:58:02",
                "leftAt": "2021-05-05 14:00:00",
                "elapsedTimePerShiftInMinutes": 481
            },
            {
                "id": 239,
                "employeeId": 2,
                "shiftId": 1,
                "enteredAt": "2021-05-06 05:58:02",
                "leftAt": "2021-05-06 14:00:00",
                "elapsedTimePerShiftInMinutes": 481
            }
        ]

    function title(elapsed) {
        var hours = Math.floor(elapsed / 60);
        var minutes = elapsed % 12;
        return hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0');
    }

    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();
    var ev = {
        id: attendanceRecords[0].id,
        title: attendanceRecords[0].enteredAt.split(' ')[1],
        start: attendanceRecords[0].enteredAt.split(' ')[0],
    }

    $('#calendar').fullCalendar({
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,basicWeek,basicDay'
        },
        locale: 'pl',
        initialView: 'dayGridMonth',
        eventClick: function (info) {
            $('#modalTitle').html(info.event.start.toLocaleDateString('pl-PL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
            $('#modalBody').html(details(info.event.extendedProps.enteredAt, info.event.extendedProps.leftAt));
            $('#calendarModal').modal();
        },
        events:
            attendanceRecords.map(record => {
                timestamp = record.enteredAt.split(' ');
                return {
                    display: 'background',
                    backgroundColor: '#4ecdc4',
                    id: record.id,
                    title: title(record.elapsedTimePerShiftInMinutes),
                    start: timestamp[0],
                    enteredAt: timestamp[1],
                    leftAt: record.leftAt.split(' ')[1]
                }
            })
    });


}();