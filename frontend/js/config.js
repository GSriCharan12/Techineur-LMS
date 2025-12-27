const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : ''; // On production, we use relative paths if hosted on same domain, or specific URL

window.API_BASE_URL = API_URL;
