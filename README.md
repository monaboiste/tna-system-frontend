# TNA System (Time and Attendance)
TNA System is efficient working time management Web Application. The solution can function as a stand-alone system, which features:
- keeping records of employees' working,
- calculating working time on a monthly basis.  

Records cover:
- the number of working hours and the start and end hours of work,
- the number of hours worked at night,
- the number of overtimes,
- days off.

___
### Project's functional requirements
##### User accounts related
| Req ID| Req Description | Priority |
|:-----:|:---------------:|:--------:|
| FR101 | The system shall provide an administrative panel for Manager (Superuser) | Highest |
| FR102 | The system shall provide administrative rights to Manager at least: create/remove user account, deactivate/activate | Highest |
| FR103 | Employee shall be able to log in to the system with given credentials | Highest |
| FR104 | User shall be able to reset password | Normal |
| FR105 | The system shall validate password strength and require combination of upper and lower case letters, special characters and digits | Low |
##### Employee time tracking system related
| Req ID| Req Description | Priority |
|:-----:|:---------------:|:--------:|
| FR201 | The system shall register Employee's clock-ins and clock-outs (ex. using NFC proximity badages at terminals) and store in database | High |
| FR202 | The system shall record the working hours of employees on a daily/mothly basis for each Employee | High |
| FR203 | Manager shall be able manually change Employees' working hours | High |

#### Frontend Technology stack:
* HTML5
* CSS
* JavaScript ES6
