const express = require('express')
const exphbs = require('express-handlebars');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const PatientDB = require('./Database/PatientDB.js');
const TherapistDB = require('./Database/TherapistDB.js');
const AuthenticationDB = require("./Database/AuthenticationDB.js");
const methodOverride = require('method-override');

var authorizer = new AuthenticationDB("WHAM_TEST");
var patientDB = new PatientDB("WHAM_TEST", authorizer);
var therapistDB = new TherapistDB("WHAM_TEST", authorizer);

var api = require("./main/api.js")
var login = require("./main/login/login.js")
var all_patients = require("./main/patients/all_patients.js")
var single_patient = require("./main/patients/id/single_patient.js")
var patient_sessions = require("./main/patients/id/sessions/patient_sessions.js")
var single_session = require("./main/patients/id/sessions/id/single_session.js")
var patient_messages = require("./main/patients/id/messages/patient_messages.js")
var single_message = require("./main/patients/id/messages/id/single_message.js")
var all_therapists = require("./main/therapists/all_therapists.js")
var single_therapist = require("./main/therapists/id/single_therapist.js")
var therapist_patients = require("./main/therapists/id/patients/therapist_patients.js")
var therapist_patient = require("./main/therapists/id/patients/id/therapist_patient.js")
var therapist_messages = require("./main/therapists/id/messages/therapist_messages.js")

app.engine('handlebars', exphbs({
    defaultLayout: false,
    helpers: {
        concat: (...args) => args.slice(0, -1).join('')
    }
}));

app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('', api.showAPI);

app.use(methodOverride('_method'))

app.get('/login', login.show_login);

app.post('/login', function (req, res) {
    login.login(req, res, patientDB, therapistDB)
});

app.get('/patients', function (req, res) {
    all_patients.getPatients(req, res, patientDB, authorizer)
})

app.post('/patients', function (req, res) {
    all_patients.addPatient(req, res, patientDB)
})

app.get('/patients/:patientID', function (req, res) {
    single_patient.getPatient(req, res, patientDB)
})

app.delete('/patients/:patientID', function (req, res) {
    single_patient.deletePatient(req, res, patientDB)
})

app.get('/patients/:patientID/sessions', function (req, res) {
    patient_sessions.getPatientSessions(req, res, patientDB)
})

app.post('/patients/:patientID/sessions', function (req, res) {
    patient_sessions.addPatientSession(req, res, patientDB)
})

app.get('/patients/:patientID/sessions/:sessionID', function (req, res) {
    single_session.getSession(req, res, patientDB)
})

app.delete('/patients/:patientID/sessions/:sessionID', function (req, res) {
    single_session.deletePatientSession(req, res, patientDB)
})

app.post('/patients/:patientID/messages', function (req, res) {
    patient_messages.addPatientMessage(req, res, patientDB)
});

app.get('/patients/:patientID/messages', function (req, res) {
    patient_messages.getPatientMessages(req, res, patientDB)
});

app.put('/patients/:patientID/messages/:messageID', function (req, res) {
    single_message.markMessageAsRead(req, res, patientDB)
});

app.get('/patients/:patientID/messages/:messageID', function (req, res) {
    single_message.getMessage(req, res, patientDB)
});

app.delete('/patients/:patientID/messages/:messageID', function (req, res) {
    single_message.deletePatientMessage(req, res, patientDB)
});

app.get('/therapists', function(req, res) {
    all_therapists.getAllTherapists(req, res, therapistDB)
})

app.post('/therapists', function(req, res) {
    all_therapists.addTherapist(req, res, therapistDB)
})

app.get('/therapists/:therapistID', function(req, res) {
    single_therapist.getTherapist(req, res, therapistDB)
})

app.delete('/therapists/:therapistID', function(req, res) {
    single_therapist.deleteTherapist(req, res, therapistDB)
})

app.get('/therapists/:therapistID/patients', function(req, res) {
    therapist_patients.getTherapistPatients(req, res, therapistDB)
})

app.post('/therapists/:therapistID/patients', function(req, res) {
    therapist_patients.addPatientTherapist(req, res, patientDB)
});

app.delete('/therapists/:therapistID/patients/:patientID', function(req, res) {
    therapist_patient.removePatientTherapist(req, res, patientDB)
});

app.get('/therapists/:therapistID/messages', function(req, res) {
    therapist_messages.getMessagesFromTherapist(req, res, therapistDB)
});

app.listen(3000, () => console.log('Example app listening on port 3000!'))