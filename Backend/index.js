const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const path = require('path');
const PatientDB = require('./Database/PatientDB.js');
const TherapistDB = require('./Database/TherapistDB.js');
const AuthenticationDB = require('./Database/AuthenticationDB.js');
const methodOverride = require('method-override');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// The database used to authenticate transactions
const authorizer = new AuthenticationDB('WHAM_TEST');
// The db used to change stuff related to patients
const patientDB = new PatientDB('WHAM_TEST', authorizer);
// The db used to change stuf related to therapists
const therapistDB = new TherapistDB('WHAM_TEST', authorizer);

// All the JS files that handle specific requests
// The file structure indicates which request URL every file handles
const api = require('./main/api.js');
const register = require('./main/register/register.js');
const login = require('./main/login/login.js');
const patient_login = require('./main/login/patient/patient_login.js');
const therapist_login = require('./main/login/therapist/therapist_login.js');
const all_patients = require('./main/patients/all_patients.js');
const single_patient = require('./main/patients/id/single_patient.js');
const patient_sessions = require('./main/patients/id/sessions/patient_sessions.js');
const single_session = require('./main/patients/id/sessions/id/single_session.js');
const patient_messages = require('./main/patients/id/messages/patient_messages.js');
const single_message = require('./main/patients/id/messages/id/single_message.js');
const all_therapists = require('./main/therapists/all_therapists.js');
const single_therapist = require('./main/therapists/id/single_therapist.js');
const therapist_patients = require('./main/therapists/id/patients/therapist_patients.js');
const therapist_patient = require('./main/therapists/id/patients/id/therapist_patient.js');
const therapist_messages = require('./main/therapists/id/messages/therapist_messages.js');

var hbs = exphbs.create({
    // Specify helpers which are only registered on this instance.
    helpers: {
        json: function(context) {
            return JSON.stringify(context);
        },
        concat: (...args) => args.slice(0, -1).join('')
    }
});

// Loads the handlebars rendering engine
app.engine('handlebars', hbs.engine);

app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, 'public')));

// Sets up the passport authenticators
// use two LocalStrategies, registered under patient and therapist
passport.use('patient', new LocalStrategy(
    function (username, password, cb) {
        patientDB.login(username, password, function (error, user) {
            if (error) {
                return cb(error, false);
            }
            if (!user) {
                return cb(null, false);
            }
            return cb(null, user);
        });
    }
));

passport.use('therapist', new LocalStrategy(
    function (username, password, cb) {
        therapistDB.login(username, password, function (error, user) {
            if (error) {
                return cb(error, false);
            }
            if (!user) {
                return cb(null, false);
            }
            return cb(null, user);
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
app.use(passport.initialize());


// Gives express the ability to parse JSON
app.use(bodyParser.json());

// Gives the ability to read cookies (for auth_token from browser)
app.use(cookieParser())

// Gives express the ability to parse query parameters
app.use(bodyParser.urlencoded({
    extended: true
}));

authorizer.load_all_permissions(function(worked) {
    if(!worked) {
        console.log("badddd");
    }
});

// If the user goes to /api it will render the API HTML
app.get('/api', api.showAPI);

// HTML Forms do not support PUT, PATCH, and DELETE so this method
// allows the form to pass a parameter _method that overrides whatever
// the existing method (probably POST) is.
app.use(methodOverride('_method'));

// Renders the registration screen as HTML
app.get('/register', register.show_register);

// Renders the login choosing screen as HTML
app.get('/login', login.show_login);

// Logs this patient
// Will give back the users authenticaiton token
app.post('/login/patient',
    passport.authenticate('patient', {
        failureRedirect: '/login/patient'
    }),
    function (req, res) {
        if(req.headers['accept'].includes("text/html")) {
            res.cookie('auth_token', req.user.token);
            res.redirect('../patients/' + req.body.username);
        } else {
            res.writeHead(200, {
                'Content-Type': 'application/json',
            });
            res.end(JSON.stringify({
                token: req.user.token,
            }));
        }
    }
);

// Renders the patient login screen as HTML
app.get('/login/patient', patient_login.show_login);

// Logs this therapist
// Will give back the users authenticaiton token
app.post('/login/therapist',
    passport.authenticate('therapist', {
        failureRedirect: '/login/therapist'
    }),
    function (req, res) {
        if(req.headers['accept'].includes("text/html")) {
            res.cookie('auth_token', req.user.token);
            res.redirect('../therapists/' + req.body.username);
        } else {
            res.writeHead(200, {
                'Content-Type': 'application/json',
            });
            res.end(JSON.stringify({
                token: req.user.token,
            }));
        }
    }
);

// Renders the therapist login screen as HTML
app.get('/login/therapist', therapist_login.show_login);

// Returns info about every patient
app.get('/patients', function (req, res) {
    all_patients.getPatients(req, res, patientDB, authorizer);
});

// Adds a patient to the DB (create an account)
// Will give back the users authenticaiton token
app.post('/patients', function (req, res) {
    all_patients.addPatient(req, res, patientDB);
});

// Returns info about this patient
app.get('/patients/:patientID', function (req, res) {
    single_patient.getPatient(req, res, patientDB, authorizer);
});

// Deletes this patient and all associated information
app.delete('/patients/:patientID', function (req, res) {
    single_patient.deletePatient(req, res, patientDB, authorizer);
});

// Returns info about every session this patient has logged
app.get('/patients/:patientID/sessions', function (req, res) {
    patient_sessions.getPatientSessions(req, res, patientDB, authorizer);
});

// Adds a session to this patients log
app.post('/patients/:patientID/sessions', function (req, res) {
    patient_sessions.addPatientSession(req, res, patientDB, authorizer);
});

// Returns informaiton about this specific session
app.get('/patients/:patientID/sessions/:sessionID', function (req, res) {
    single_session.getSession(req, res, patientDB, authorizer);
});

// Deletes this specific session
app.delete('/patients/:patientID/sessions/:sessionID', function (req, res) {
    single_session.deletePatientSession(req, res, patientDB, authorizer);
});

// Sends a message to this patient
app.post('/patients/:patientID/messages', function (req, res) {
    patient_messages.addPatientMessage(req, res, patientDB, authorizer);
});

// Returns every message this patient has recieved
app.get('/patients/:patientID/messages', function (req, res) {
    patient_messages.getPatientMessages(req, res, patientDB, authorizer);
});

// Marks this message as read
app.put('/patients/:patientID/messages/:messageID', function (req, res) {
    single_message.markMessageAsRead(req, res, patientDB, authorizer);
});

// Return info about this message in specific
app.get('/patients/:patientID/messages/:messageID', function (req, res) {
    single_message.getMessage(req, res, patientDB, authorizer);
});

// Deletes this message from the DB
app.delete('/patients/:patientID/messages/:messageID', function (req, res) {
    single_message.deletePatientMessage(req, res, patientDB, authorizer);
});

// Returns info about every therapist
app.get('/therapists', function (req, res) {
    all_therapists.getAllTherapists(req, res, therapistDB, authorizer);
});

// Adds a therapist to the DB
// Will give back the users authenticaiton token
app.post('/therapists', function (req, res) {
    all_therapists.addTherapist(req, res, therapistDB);
});

// Returns info about this therapist in particuliar
app.get('/therapists/:therapistID', function (req, res) {
    single_therapist.getTherapist(req, res, therapistDB, authorizer);
});

// Removed this therapist and all assicated information from the server
app.delete('/therapists/:therapistID', function (req, res) {
    single_therapist.deleteTherapist(req, res, therapistDB, authorizer);
});

// Returns info about this therapists patients
app.get('/therapists/:therapistID/patients', function (req, res) {
    therapist_patients.getTherapistPatients(req, res, therapistDB, authorizer);
});

// Pairs the given patient with this therapist
app.post('/therapists/:therapistID/patients', function (req, res) {
    therapist_patients.addPatientTherapist(req, res, patientDB, authorizer);
});

// Unpairs this therapist from this patient
// DOES NOT delete the pair, simply marks its "date_removed" as today
app.delete('/therapists/:therapistID/patients/:patientID', function (req, res) {
    therapist_patient.removePatientTherapist(req, res, patientDB, authorizer);
});

// Returns every message this therapist has sent
app.get('/therapists/:therapistID/messages', function (req, res) {
    therapist_messages.getMessagesFromTherapist(req, res, therapistDB, authorizer);
});

app.listen(3000, () => console.log('WHAM listening on port 3000!'));

module.exports = app; // for testing with chai
