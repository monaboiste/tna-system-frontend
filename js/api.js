const BASE_URL = 'https://tna-system-backend.herokuapp.com';
// const BASE_URL = 'http://localhost:8080';
const PREFIX = '/api';
const API_URL = `${BASE_URL}${PREFIX}`;

/* export default class Api {
    static async fetchCurrentUser() {
        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-type': 'application/json',
                'Authorization': `Basic + ${localStorage.getItem('token')}`,
            },
        };

        const response = await fetch(`${API_URL}/users/currenst`, requestOptions);
        if (response.ok) {
            return response.json();
        }
        return Promise.reject(response);
    }
}
 */
export { API_URL as apiUrl };