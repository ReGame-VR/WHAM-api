const express = require('express');
const exphbs = require('express-handlebars');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

const AuthenticationDB = require('../database/AuthenticationDB.js');

const patient_login = require('../main/login/patient/patient_login.js');
const therapist_login = require('../main/login/therapist/therapist_login.js');
const login = require('../main/login/login.js');

const login_route = express.Router();

const authDB = new AuthenticationDB();

// Sets up the passport authenticators
// use two LocalStrategies, registered under patient and therapist
passport.use('patient', new LocalStrategy(
    function (username, password, cb) {
        authDB.login(username, password).then(user => {
            return cb(null, user);
        }).catch(error => {
            cb(null, false);
        });
    }
));

passport.use('therapist', new LocalStrategy(
    function (username, password, cb) {
        authDB.login(username, password).then(user => {
            return cb(null, user);
        }).catch(error => {
            cb(null, false);
        });
    }
));

passport.serializeUser(function (user, cb) {
    cb(null, user.token);
});

passport.deserializeUser(function (id, cb) {
    cb(null, {
        token: id
    });
});

// Initialize Passport and restore authentication state, if any, from the
// session.
login_route.use(passport.initialize());

// Renders the login choosing screen as HTML
login_route.get('/', login.show_login);

// Logs this patient
// Will give back the users authenticaiton token
login_route.post('/patient',
    passport.authenticate('patient', {
        failureRedirect: '/login/patient'
    }),
    patient_login.patient_login
);

// Renders the patient login screen as HTML
login_route.get('/patient', patient_login.show_login);

// Logs this therapist
// Will give back the users authenticaiton token
login_route.post('/therapist',
    passport.authenticate('therapist', {
        failureRedirect: '/login/therapist'
    }),
    therapist_login.therapist_login
);

// Renders the therapist login screen as HTML
login_route.get('/therapist', therapist_login.show_login);

module.exports = login_route;
