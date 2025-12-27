const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : window.location.origin; // On production, use the current domain origin

window.API_BASE_URL = API_URL;
