const express = require('express');

const patient_login = require('../main/login/patient/patient_login.js');
const therapist_login = require('../main/login/therapist/therapist_login.js');
const login = require('../main/login/login.js');

const login_route = express.Router();

// Renders the login choosing screen as HTML
login_route.get('/', login.show_login);

// Logs this patient
// Will give back the users authenticaiton token
login_route.post('/patient',
    login.user_login("patient")
);

// Renders the patient login screen as HTML
login_route.get('/patient', patient_login.show_login);

// Logs this therapist
// Will give back the users authenticaiton token
login_route.post('/therapist',
    login.user_login("therapist")
);

// Renders the therapist login screen as HTML
login_route.get('/therapist', therapist_login.show_login);

module.exports = login_route;
