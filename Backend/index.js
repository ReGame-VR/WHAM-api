const express = require('express')
const exphbs = require('express-handlebars');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql');

app.engine('handlebars', exphbs({
    defaultLayout: false,
    helpers: {
        concat: (...args) => args.slice(0, -1).join('')
    }
}));

app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json())

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password'
});

connection.connect();

app.get('/patients', getPatients)

//Gives all patient info in either JSON or HTML form
function getPatients(req, res) {
    // var sql_no_session = "SELECT * FROM PATIENT"; // gives just the patient info
    var sql = "SELECT * FROM PATIENT P, PATIENT_SESSION PS WHERE P.username = PS.patientID";
    // Returns all patient info and all session info for every patient
    sql = mysql.format(sql, []);
    connection.query(sql, function(error, results, fields) {
        if (error) throw error;
        if (req.headers['accept'].includes('text/html')) {
            //Send patient info as HTML
        } else if (req.headers['accept'].includes('application/json')) {
            //Send patient info as JSON
        } else {
            //An unsupported request
        }
    });
    res.send("GET Patients");
}

app.post('/patients', addPatient)

//Adds the patient to the database
function addPatient(req, res) {
    // Username, password, DOB, Weight, Height, (?) Information
    var sql = "INSERT INTO PATIENTS VALUES (?, ?, ?, ?, ?, ?)"
    var username = req.param('username', null);
    var password = req.param('password', null);
    var dob = req.param('dob', null);
    var weight = req.param('weight', null);
    var height = req.param('height', null);
    var information = req.param('information', ""); // Default of empty string

    var inserts = [username, password, dob, weight, height, information];
    sql = mysql.format(sql, inserts);
    connection.query(sql, function(error, results, fields) {
        if (error) {
            res.send("Could Not Add");
            throw error;
        }
    });
    res.send("ADD Patients");
}

app.get('/patients/:patientID', getPatient)

//Returns the info for a single patient
function getPatient(req, res) {
    var username = req.param('username', null);
    var patientInfoQuerry = "SELECT * FROM PATIENT P WHERE P.username = ?";
    var patientSessionQuerry = "SELECT * FROM PATIENT_SESSION PS WHERE PS.patientID = ?";
    var patientMessageQuerry = "SELECT * FROM PATIENT_MESSAGE PM WHERE P.patientID = ?";

    if (req.headers['accept'].includes('text/html')) {
        //Send patient info as HTML
        res.render('patient-detail');
    } else if (req.headers['accept'].includes('application/json')) {
        //Send patient info as JSON
    } else {
        //An unsupported request
    }
}

app.delete('/patients/:patientID', deletePatient)

//Deletes this patient from the database
function deletePatient(req, res) {
    res.send("DELETE Patient " + req.params['patientID']);
}

app.get('/patients/:patientID/sessions', getPatientSessions)

//Returns the info for a patients activity sessions
function getPatientSessions(req, res) {
    if (req.headers['accept'].includes('text/html')) {
        //Send patient info as HTML
    } else if (req.headers['accept'].includes('application/json')) {
        //Send patient info as JSON
    } else {
        //An unsupported request
    }
    res.send("GET Sessions For Patient " + req.params['patientID']);
}

app.post('/patients/:patientID/sessions', addPatientSession)

//Adds the session for the given patient to the database
function addPatientSession(req, res) {
    res.send("Add Patient Session for Patient " + req.params['patientID']);
}

app.get('/patients/:patientID/sessions/:sessionID', getSession)

//Returns the info for a single patient session
function getSession(req, res) {
    if (req.headers['accept'].includes('text/html')) {
        //Send patient info as HTML
    } else if (req.headers['accept'].includes('application/json')) {
        //Send patient info as JSON
    } else {
        //An unsupported request
    }
    res.send("GET Patient Session for Patient" + req.params['patientID'] + " At Session ID " + req.params['sessionID']);
}

app.delete('/patients/:patientID/sessions/:sessionID', deletePatientSession)

//Deletes this patient session from the database
function deletePatientSession(req, res) {
    res.send("DELETE Patient Session for Patient" + req.params['patientID'] + " At Session ID " + req.params['sessionID']);
}

app.get('/therapists', getAllTherapists)

//Gives all therapist info in either JSON or HTML form
function getAllTherapists(req, res) {
    if (req.headers['accept'].includes('text/html')) {
        //Send therapist info as HTML
    } else if (req.headers['accept'].includes('application/json')) {
        //Send therapist info as JSON
    } else {
        //An unsupported request
    }
    res.send("GET Therapists");
}

app.post('/therapists', addTherapist)

//Adds the therapist to the database
function addTherapist(req, res) {
    res.send("ADD Therapist");
}

app.get('/therapists/:therapistID', getTherapist)

//Returns the info for a single therapist
function getTherapist(req, res) {
    if (req.headers['accept'].includes('text/html')) {
        //Send therapist info as HTML
        res.render('patient-overview', {
            patients: [{
                    name: "John Doe",
                    lastActive: "1 day ago",
                    latestScore: 80,
                    id: 1
                },
                {
                    name: "Mary Moe",
                    lastActive: "3 hours ago",
                    latestScore: 72,
                    id: 2
                }
            ]
        });
    } else if (req.headers['accept'].includes('application/json')) {
        //Send therapist info as JSON
    } else {
        //An unsupported request
    }
}

app.delete('/therapists/:therapistID', deleteTherpist)

//Deletes this therapist from the database
function deleteTherpist(req, res) {
    res.send("DELETE Therapist " + req.params['therapistID']);
}

app.get('/therapists/:therapistID/patients', getTherapistPatients)

//Returns the info for all patients of this therapist
function getTherapistPatients(req, res) {
    if (req.headers['accept'].includes('text/html')) {
        //Send therapist-patient info as HTML
    } else if (req.headers['accept'].includes('application/json')) {
        //Send therapist-patient info as JSON
    } else {
        //An unsupported request
    }
    res.send("GET Patients for Therapist " + req.params['therapistID']);
}


app.listen(3000, () => console.log('Example app listening on port 3000!'))


//connection.end(); put somewhere
