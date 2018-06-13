const express = require('express');

const login_route = require('../routers/login_router.js');
const therapist_route = require('../routers/therapist_router.js');
const patient_route = require('../routers/patient_router.js');

const all_patients = require('../main/patients/all_patients.js');
const all_therapists = require('../main/therapists/all_therapists.js');
const api = require('../main/api.js');
const register = require('../main/register/register.js');
const logout = require('../main/logout/logout.js');

const main_route = express.Router();

// Permissions for adding users are very loose (anyone can do it)
// so we have to make a specific exception for not putting these ones in their routers

// Adds a patient to the DB (create an account)
// Will give back the users authenticaiton token
main_route.post('/patients', all_patients.addPatient);

// Adds a therapist to the DB
// Will give back the users authenticaiton token
main_route.post('/therapists', all_therapists.addTherapist);

// Sets the router for /login
main_route.use('/login',login_route);

// Sets the router for /therapists
main_route.use('/therapists', therapist_route);

// Sets the router for /patients
main_route.use('/patients', patient_route);

// If the user goes to /api it will render the API HTML
main_route.get('/api', api.showAPI);

// Renders the registration screen as HTML
main_route.get('/register', register.show_register);

// Clears the cookies and shows the logout screen
main_route.get('/logout', logout.show_logout);

module.exports = main_route;