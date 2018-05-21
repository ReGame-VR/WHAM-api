const express = require('express')
const exphbs = require('express-handlebars');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const PatientDB = require('./Database/PatientDB.js');
const TherapistDB = require('./Database/TherapistDB.js');

var patientDB = new PatientDB("WHAM_TEST");
var therapistDB = new TherapistDB("WHAM_TEST");

app.engine('handlebars', exphbs({
    defaultLayout: false,
    helpers: {
        concat: (...args) => args.slice(0, -1).join('')
    }
}));

app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json())

app.post('/login', login);

function login(req, res) {
    patientDB.login(req.param('username', null), req.param('password', null), function (sucess) {
        if (sucess) {
            res.status(200);
            res.send(JSON.stringify(sucess));
        } else {
            therapistDB.login(req.param('username', null), req.param('password', null), function (sucess) {
                if (sucess) {
                    res.status(200);
                    res.send(JSON.stringify(sucess));
                } else {
                    res.status(403);
                    res.send(JSON.stringify("Invalid password"));
                }
            });
        }
    });
}

app.get('/patients', getPatients)

//Gives all patient info in either JSON or HTML form
function getPatients(req, res) {
    patientDB.get_all_patient_info(function (response) {
        if (req.headers['accept'].includes('text/html')) {
            res.send("Not Supported Yet");
        } else if (req.headers['accept'].includes('application/json')) {
            res.status(200);
            res.send(JSON.stringify(response));
        } else {
            res.send("Not Supported Yet");
        }
    });
}

app.post('/patients', addPatient)

//Adds the patient to the database
function addPatient(req, res) {
    // Username, password, DOB, Weight, Height, (?) Information
    var username = req.param('username', null);
    var password = req.param('password', null);
    var dob = req.param('dob', null);
    var weight = req.param('weight', null);
    var height = req.param('height', null);
    var information = req.param('information', ""); // Default of empty string
    patientDB.add_patient(username, unencrypt_password, dob, weight, height, information, function (worked) {
        if (worked !== false) {
            res.status(200);
            res.send(JSON.stringify(worked));
        } else {
            res.status(403);
            res.send(JSON.stringify("User already exists"));
        }
    });
    res.send("ADD Patients");
}

app.get('/patients/:patientID', getPatient)

//Returns the info for a single patient
function getPatient(req, res) {
    patientDB.get_patient_info(id, function (info, sessions, messages) {
        var id = req.params.patientID
        if (req.headers['accept'].includes('text/html')) {
            res.render('patient-detail');
        } else if (req.headers['accept'].includes('application/json')) {
            if (info === false) {
                res.status(403);
                res.send(JSON.stringify("User does not exist"));
            } else {
                res.status(200);
                res.send(JSON.stringify(info, sessions, messages));
            }
            //Send patient info as JSON
        } else {
            //An unsupported request
        }
    });
}

app.delete('/patients/:patientID', deletePatient)

//Deletes this patient from the database
function deletePatient(req, res) {
    patientDB.delete_patient(req.params.patientID, function(worked) {
        if(worked === false) {
            res.status(403);
            res.send("Bad request");
        } else {
            res.status(204);
            res.send();
        }
    });
}

app.get('/patients/:patientID/sessions', getPatientSessions)

//Returns the info for a patients activity sessions
function getPatientSessions(req, res) {
    patientDB.get_patient_sessions(req.params.patientID, function(sessions) {
        if (req.headers['accept'].includes('text/html')) {
            //Send patient info as HTML
        } else if (req.headers['accept'].includes('application/json')) {
            if(sessions === false) {
                res.status(403);
                res.send()
            } else {
                res.status(200);
                res.send(JSON.stringify(sessions));
            }
        } else {
            //An unsupported request
        }
    });
    
    res.send("GET Sessions For Patient " + req.params['patientID']);
}

app.post('/patients/:patientID/sessions', addPatientSession)

//Adds the session for the given patient to the database
function addPatientSession(req, res) {
    var patientID = req.params.patientID;
    var score = req.param('score', null);
    var time = req.param('date', null);
    patientDB.add_patient_session(patientID, score, time, function(worked) {
        if(worked) {
            res.status(204);
            res.send();
        } else {
            res.status(403);
            res.send("Session could not be added");
        }
    });
}

app.get('/patients/:patientID/sessions/:time', getSession)

//Returns the info for a single patient session
function getSession(req, res) {
    var patientID = req.params.patientID;
    var time = req.params.time;
    patientDB.get_patient_session_specific(patientID, time, function(sessionInfo) {
        if (req.headers['accept'].includes('text/html')) {
            //Send patient info as HTML
        } else if (req.headers['accept'].includes('application/json')) {
            if(sessionInfo === false) {
                res.status(403);
                res.send("Bad request.");
            } else {
                res.status(200);
                res.send(JSON.stringify(sessionInfo));
            }
        } else {
            //An unsupported request
        }
    })
}

app.delete('/patients/:patientID/sessions/:time', deletePatientSession)

//Deletes this patient session from the database
function deletePatientSession(req, res) {
    var patientID = req.params.patientID;
    var time = req.params.time;
    patientDB.delete_patient_session(patientID, time, function(worked) {
        if(worked) {
            res.status(204);
            res.send();
        } else {
            res.status(403);
            res.send("Bad request.");
        }
    });
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
    therapistDB.get_all_therapists(function(info) {
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
            if(info === false) {
                res.status(403);
                res.send("Bad request");
            } else {
                res.status(200);
                res.send(JSON.stringify(info));
            }
        } else {
            //An unsupported request
        }
    });
}

app.delete('/therapists/:therapistID', deleteTherpist)

//Deletes this therapist from the database
function deleteTherpist(req, res) {
    var therapistID = req.params.therapistID;
    therapistDB.delete_therapist(therapistDB, function(worked) {
        if(worked) {
            res.status(204);
            res.send();
        } else {
            res.status(403);
            res.send("Bad request");
        }
    })
    res.send("DELETE Therapist " + req.params['therapistID']);
}

app.get('/therapists/:therapistID/patients', getTherapistPatients)

//Returns the info for all patients of this therapist
function getTherapistPatients(req, res) {
    var therapistID = req.params.therapistID;
    therapistDB.get_all_patients(therapistDB, function(info) {
        if (req.headers['accept'].includes('text/html')) {
            //Send therapist-patient info as HTML
        } else if (req.headers['accept'].includes('application/json')) {
            if(info === false) {
                res.status(403);
                res.send("Bad request");
            } else {
                res.status(200);
                res.send(JSON.stringify(info));
            }
        } else {
            //An unsupported request
        }
    })
    res.send("GET Patients for Therapist " + req.params['therapistID']);
}


app.listen(3000, () => console.log('Example app listening on port 3000!'))