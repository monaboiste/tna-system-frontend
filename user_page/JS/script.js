let username = sessionStorage.getItem('username');
let password = sessionStorage.getItem('password');
let id = sessionStorage.getItem('id');


window.onload = function (){
    fetchUserData();
}

function fetchUserData(){
    myHeaders = new Headers();
    myHeaders.append("Content-type", "application/json")
    myHeaders.append("Authorization", "Basic " + btoa(`${username}:${password}`));

    let raw = "";

    let requestOptions = {
    method: 'GET',
    headers: myHeaders,
    };
    
    // fetch(`https://tna-system.herokuapp.com/api/employees/${id}`, requestOptions)
    // .then((response) => {
    //     if(response.ok){
    //         return response.json();
    //     }
    //     else console.log("Nie działa");
    // })
    // .then((data) => {
    //     console.log(data);
    //     let output = 
    //     `
    //     <ul>
    //         <li>Imię: ${data.firstName}         </li>
    //         <li>Nazwisko: ${data.lastName}      </li>
    //         <li>Dział: ${data.department}       </li>
    //         <li>Ulica: ${data.street}           </li>
    //         <li>Kod pocztowy: ${data.postCode}  </li>
    //         <li>Miasto: ${data.city}            </li>
    //         <li>Nr umowy: ${data.contractId}    </li>
    //     </ul>
    //     `;

    //     document.getElementById('employeeData').innerHTML = output;

    // })
    // .catch(error => {
    //     console.log('error', error);
    // });

    fetch(`../JS/dummy.json`, requestOptions)
    .then((response) => {
        if(response.ok){
            return response.json();
        }
        else console.log("Nie działa");
    })
    .then((data) => {
        console.log(data);
        let output = 
        `
        <ul>
            <li>Imię: ${data.firstName}         </li>
            <li>Nazwisko: ${data.lastName}      </li>
            <li>Dział: ${data.department}       </li>
            <li>Ulica: ${data.street}           </li>
            <li>Kod pocztowy: ${data.postCode}  </li>
            <li>Miasto: ${data.city}            </li>
            <li>Nr umowy: ${data.contractId}    </li>
        </ul>
        `;

        document.getElementById('employeeData').innerHTML = output;

    })
    .catch(error => {
        console.log('error', error);
    });
}
