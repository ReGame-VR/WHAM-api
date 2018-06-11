const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const path = require('path');
const PatientDB = require('./database/PatientDB.js');
const TherapistDB = require('./database/TherapistDB.js');
const AuthenticationDB = require('./database/AuthenticationDB.js');
const ResetDB = require('./database/ResetDB.js');
const HTTPResponses = require('./helpers/http-responses.js');
const methodOverride = require('method-override');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// The database used to authenticate transactions
const authorizer = new AuthenticationDB('WHAM_TEST');
// The db used to change stuff related to patients
const patientDB = new PatientDB('WHAM_TEST', authorizer);
// The db used to change stuf related to therapists
const therapistDB = new TherapistDB('WHAM_TEST', authorizer);
// The db that the admin can query to to reset the app
const resetDB = new ResetDB("WHAM_TEST", patientDB);

// The class that handles sending the actual info
const responder = new HTTPResponses();

// The file path that has the code for verifying the JWT and checking permissions
const auth_helpers = require('./helpers/auth_helper.js');

// All the JS files that handle specific requests
// The file structure indicates which request URL every file handles
const api = require('./main/api.js');
const register = require('./main/register/register.js');
const login = require('./main/login/login.js');
const logout = require('./main/logout/logout.js');
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
        json: function (context) {
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

// Loads all the DB/helpers to the Req
app.use(function (req, res, next) {
    req.patientDB = patientDB;
    req.therapistDB = therapistDB;
    req.authorizer = authorizer;
    req.responder = responder;
    req.resetDB = resetDB;
    next();
})

// Resets the ACL permissions based on the DB entries
authorizer.load_all_permissions(function (worked) {
    if (!worked) {
        throw new Error("This shouldn't fail");
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

// Clears the cookies and shows the logout screen
app.get('/logout', logout.show_logout);

// Renders the login choosing screen as HTML
app.get('/login', login.show_login);

// Logs this patient
// Will give back the users authenticaiton token
app.post('/login/patient',
    passport.authenticate('patient', {
        failureRedirect: '/login/patient'
    }),
    patient_login.patient_login
);

// Renders the patient login screen as HTML
app.get('/login/patient', patient_login.show_login);

// Logs this therapist
// Will give back the users authenticaiton token
app.post('/login/therapist',
    passport.authenticate('therapist', {
        failureRedirect: '/login/therapist'
    }),
    therapist_login.therapist_login
);

// Renders the therapist login screen as HTML
app.get('/login/therapist', therapist_login.show_login);

// Returns info about every patient
app.get('/patients', auth_helpers.hasAdminPriv, all_patients.getPatients);

// Adds a patient to the DB (create an account)
// Will give back the users authenticaiton token
app.post('/patients', all_patients.addPatient);

// Returns info about this patient
app.get('/patients/:patientID', auth_helpers.canViewPatient, single_patient.getPatient);

// Deletes this patient and all associated information
app.delete('/patients/:patientID', auth_helpers.canViewPatient, single_patient.deletePatient);

// Returns info about every session this patient has logged
app.get('/patients/:patientID/sessions', auth_helpers.canViewPatient, patient_sessions.getPatientSessions);

// Adds a session to this patients log
app.post('/patients/:patientID/sessions', auth_helpers.canViewPatient, patient_sessions.addPatientSession);

// Returns informaiton about this specific session
app.get('/patients/:patientID/sessions/:sessionID', auth_helpers.canViewPatient, single_session.getSession);

// Deletes this specific session
app.delete('/patients/:patientID/sessions/:sessionID', auth_helpers.canViewPatient, single_session.deletePatientSession);

// Sends a message to this patient
app.post('/patients/:patientID/messages', auth_helpers.canViewPatient, patient_messages.addPatientMessage);

// Returns every message this patient has recieved
app.get('/patients/:patientID/messages', auth_helpers.canViewPatient, patient_messages.getPatientMessages);

// Marks this message as read
app.patch('/patients/:patientID/messages/:messageID', auth_helpers.canViewPatient, auth_helpers.canViewMessage, single_message.markMessageAsRead);

// Marks this message as read
app.put('/patients/:patientID/messages/:messageID', auth_helpers.canViewPatient, auth_helpers.canViewMessage, single_message.replyToMessage);

// Return info about this message in specific
app.get('/patients/:patientID/messages/:messageID', auth_helpers.canViewPatient, auth_helpers.canViewMessage, single_message.getMessage);

// Deletes this message from the DB
app.delete('/patients/:patientID/messages/:messageID', auth_helpers.canViewPatient, auth_helpers.canViewMessage, single_message.deletePatientMessage);

// Returns info about every therapist
app.get('/therapists', auth_helpers.hasAdminPriv, all_therapists.getAllTherapists);

// Adds a therapist to the DB
// Will give back the users authenticaiton token
app.post('/therapists', all_therapists.addTherapist);

// Returns info about this therapist in particuliar
app.get('/therapists/:therapistID', auth_helpers.canViewTherapist, single_therapist.getTherapist);

// Removed this therapist and all assicated information from the server
app.delete('/therapists/:therapistID', auth_helpers.canViewTherapist, single_therapist.deleteTherapist);

// Returns info about this therapists patients
app.get('/therapists/:therapistID/patients', auth_helpers.canViewTherapist, therapist_patients.getTherapistPatients);

// Pairs the given patient with this therapist
app.post('/therapists/:therapistID/patients', auth_helpers.canViewTherapist, therapist_patients.addPatientTherapist);

// Unpairs this therapist from this patient
// DOES NOT delete the pair, simply marks its "date_removed" as today
app.delete('/therapists/:therapistID/patients/:patientID', auth_helpers.canViewTherapist, auth_helpers.canViewPatient, therapist_patient.removePatientTherapist);

// Accepts this patient-therapist join
// Marks is_accepted as true
app.patch('/therapists/:therapistID/patients/:patientID', auth_helpers.canViewPatient, therapist_patient.acceptPair);

// Returns every message this therapist has sent
app.get('/therapists/:therapistID/messages', auth_helpers.canViewTherapist, therapist_messages.getMessagesFromTherapist);

app.listen(3000, () => console.log('WHAM listening on port 3000!'));

// The helper to reset the app
const resetApp = function(callback) {
    authorizer.remove_all_permissions(function (worked) {
        if(worked === false) {
            callback(false);
        } else {
            resetDB.reset_db(function (token) {
                if(token === false) {
                    callback(false)
                } else {
                    authorizer.reset_self(function(worked) {
                        if(worked === false) {
                            callback(false);
                        } else {
                            callback(token);
                        }
                    });
                }                
            });
        }
    });
}


module.exports = {
    app: app,
    reset: resetApp
}; // for testing with chai