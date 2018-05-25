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

app.get('', showAPI);

app.use(methodOverride('_method'))

function showAPI(req, res) {
    if (req.headers['accept'].includes('text/html')) {
        res.render('api');
    } else if (req.headers['accept'].includes('application/json')) {
        res.writeHead(403, {
            "Content-Type": "application/json"
        });
        res.end();
    } else {
        res.writeHead(403, {
            "Content-Type": "application/json"
        });
        res.end();
    }
}

app.get('/login', show_login);

function show_login(req, res) {
    res.render('login');
}

app.post('/login', login);

function login(req, res) {
    patientDB.login(req.body.username, req.body.password, function (sucess) {
        if (sucess) {
            res.writeHead(200, {
                "Content-Type": "application/json"
            });
            res.end(JSON.stringify({
                token: sucess
            }));
        } else {
            therapistDB.login(req.body.username, req.body.password, function (sucess) {
                if (sucess) {
                    res.writeHead(200, {
                        "Content-Type": "application/json"
                    });
                    res.end(JSON.stringify({
                        token: sucess
                    }));
                } else {
                    res.writeHead(403, {
                        "Content-Type": "application/json"
                    });
                    res.end(JSON.stringify({
                        error: "Invalid password"
                    }));
                }
            });
        }
    });
}

app.get('/patients', getPatients)

//Gives all patient info in either JSON or HTML form
function getPatients(req, res) {
    if (req.query === undefined || req.query.auth_token === undefined) {
        if (req.headers['accept'].includes('text/html')) {
            show_login(req, res);
        } else {
            res.writeHead(403, {
                "Content-Type": "application/json"
            });
            res.end();
        }
    } else {
        authorizer.get_auth_level(req.query.auth_token, "PATIENT", function (auth_level, username) {
            if (auth_level !== "3") {
                if (req.headers['accept'].includes('text/html')) {
                    show_login(req, res);
                } else {
                    res.writeHead(403, {
                        "Content-Type": "application/json"
                    });
                    res.end();
                }
            } else {
                patientDB.get_all_patient_info(function (info) {
                    if (req.headers['accept'].includes('text/html')) {
                        //Send therapist info as HTML
                        res.render('patient-overview', {
                            patients: info
                        });
                    } else if (req.headers['accept'].includes('application/json')) {
                        res.writeHead(200, {
                            "Content-Type": "application/json"
                        });
                        res.end(JSON.stringify(info));
                    } else {
                        res.writeHead(403);
                        res.end();
                    }
                });
            }
        });
    }
}

app.post('/patients', addPatient)

//Adds the patient to the database
function addPatient(req, res) {
    // Username, password, DOB, Weight, Height, (?) Information
    var username = req.body.username
    if (username.includes(" ")) {
        res.writeHead(403, {
            "Content-Type": "application/json"
        });
        res.end(JSON.stringify({
            error: "User already exists"
        }));
        return;
    }
    var unencrypt_password = req.body.password
    var dob = req.body.dob
    var weight = req.body.weight
    var height = req.body.height
    var information = req.body.information
    patientDB.add_patient(username, unencrypt_password, dob, weight, height, information, function (worked) {
        if (worked !== false) {
            res.writeHead(200, {
                "Content-Type": "application/json"
            });
            res.end(JSON.stringify({
                token: worked
            }));
        } else {
            res.writeHead(403, {
                "Content-Type": "application/json"
            });
            res.end(JSON.stringify({
                error: "User already exists"
            }));
        }
    });
}

app.get('/patients/:patientID', getPatient)

//Returns the info for a single patient
function getPatient(req, res) {
    var id = req.params.patientID
    patientDB.get_patient_info(id, function (info, sessions, messages) {
        if (req.headers['accept'].includes('text/html')) {
            res.render('patient-detail', {
                info: info,
                sessions: sessions,
                messages: messages
            });
        } else if (req.headers['accept'].includes('application/json')) {
            if (info === false) {
                res.writeHead(403, {
                    "Content-Type": "application/json"
                });
                res.end(JSON.stringify({
                    error: "User does not exist"
                }));
            } else {
                res.writeHead(200, {
                    "Content-Type": "application/json"
                });
                res.end(JSON.stringify({
                    info: info,
                    sessions: sessions,
                    messages: messages
                }));
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
    patientDB.delete_patient(req.params.patientID, function (worked) {
        if (worked === false) {
            res.writeHead(403, {
                "Content-Type": "application/json"
            });
            res.end();
        } else {
            res.writeHead(204, {
                "Content-Type": "application/json"
            });
            res.end();
        }
    });
}

app.get('/patients/:patientID/sessions', getPatientSessions)

//Returns the info for a patients activity sessions
function getPatientSessions(req, res) {
    patientDB.get_patient_sessions(req.params.patientID, function (sessions) {
        if (req.headers['accept'].includes('text/html')) {
            res.render('patient-session-overview', {
                username: req.params.patientID,
                sessions: sessions
            });
        } else if (req.headers['accept'].includes('application/json')) {
            if (sessions === false) {
                res.writeHead(403, {
                    "Content-Type": "application/json"
                });
                res.end();
            } else {
                res.writeHead(200, {
                    "Content-Type": "application/json"
                });
                res.end(JSON.stringify(sessions));
            }
        } else {
            //An unsupported request
        }
    });
}

app.post('/patients/:patientID/sessions', addPatientSession)

//Adds the session for the given patient to the database
function addPatientSession(req, res) {
    var patientID = req.params.patientID;
    var score = req.body.score;
    var time = req.body.time;
    patientDB.add_patient_session(patientID, score, time, function (worked) {
        if (worked) {
            res.writeHead(204, {
                "Content-Type": "application/json"
            });
            res.end();
        } else {
            res.writeHead(403, {
                "Content-Type": "application/json"
            });
            res.end();
        }
    });
}

app.get('/patients/:patientID/sessions/:sessionID', getSession)

//Returns the info for a single patient session
function getSession(req, res) {
    var patientID = req.params.patientID;
    var sessionID = req.params.sessionID;
    patientDB.get_patient_session_specific(patientID, sessionID, function (sessionInfo) {
        if (req.headers['accept'].includes('text/html')) {
            res.send("Getting this session");
        } else if (req.headers['accept'].includes('application/json')) {
            if (sessionInfo === false) {
                res.writeHead(403, {
                    "Content-Type": "application/json"
                });
                res.end();
            } else {
                res.writeHead(200, {
                    "Content-Type": "application/json"
                });
                res.end(JSON.stringify(sessionInfo));
            }
        } else {
            //An unsupported request
        }
    })
}

app.delete('/patients/:patientID/sessions/:sessionID', deletePatientSession)

//Deletes this patient session from the database
function deletePatientSession(req, res) {
    var patientID = req.params.patientID;
    var sessionID = req.params.sessionID;
    patientDB.delete_patient_session(patientID, sessionID, function (worked) {
        if (worked) {
            res.writeHead(204, {
                "Content-Type": "application/json"
            });
            res.end();
        } else {
            res.writeHead(403, {
                "Content-Type": "application/json"
            });
            res.end();
        }
    });
}

app.post('/patients/:patientID/messages', addPatientMessage);

function addPatientMessage(req, res) {
    var patientID = req.params.patientID;
    var therapistID = req.body.therapistID;
    var message_content = req.body.message_content;
    var date_sent = req.body.date_sent;
    patientDB.send_patient_a_message(patientID, therapistID, message_content, date_sent, function (worked) {
        if (worked) {
            res.writeHead(204, {
                "Content-Type": "application/json"
            });
            res.end();
        } else {
            res.writeHead(403, {
                "Content-Type": "application/json"
            });
            res.end();
        }
    });
}

app.get('/patients/:patientID/messages', getPatientMessages);

function getPatientMessages(req, res) {
    var patientID = req.params.patientID;
    patientDB.get_all_messages_for(patientID, function(messages) {
        if (req.headers['accept'].includes('text/html')) {
            res.send("Getting these messages");
        } else if (req.headers['accept'].includes('application/json')) {
            if (messages === false) {
                res.writeHead(403, {
                    "Content-Type": "application/json"
                });
                res.end();
            } else {
                res.writeHead(200, {
                    "Content-Type": "application/json"
                });
                res.end(JSON.stringify(messages));
            }
        } else {
            //An unsupported request
        }
    });
}

app.put('/patients/:patientID/messages/:messageID', markMessageAsRead);

function markMessageAsRead(req, res) {
    var patientID = req.params.patientID;
    var messageID = req.params.messageID;
    patientDB.mark_message_as_read(patientID, messageID, function (worked) {
        if (worked) {
            res.writeHead(204, {
                "Content-Type": "application/json"
            });
            res.end();
        } else {
            res.writeHead(403, {
                "Content-Type": "application/json"
            });
            res.end();
        }
    });
}

app.get('/patients/:patientID/messages/:messageID', getMessage);

function getMessage(req, res) {
    var patientID = req.params.patientID;
    var messageID = req.params.messageID;
    patientDB.get_specific_message(patientID, messageID, function(message_content) {
        if (req.headers['accept'].includes('text/html')) {
            res.send("Getting this message");
        } else if (req.headers['accept'].includes('application/json')) {
            if (message_content === false) {
                res.writeHead(403, {
                    "Content-Type": "application/json"
                });
                res.end();
            } else {
                res.writeHead(200, {
                    "Content-Type": "application/json"
                });
                res.end(JSON.stringify(message_content));
            }
        } else {
            //An unsupported request
        }
    });
}

app.get('/therapists', getAllTherapists)

//Gives all therapist info in either JSON or HTML form
function getAllTherapists(req, res) {
    therapistDB.get_all_therapists(function (therapists) {
        if (req.headers['accept'].includes('text/html')) {
            res.render('therapist-overview', {
                therapists: therapists
            });
        } else if (req.headers['accept'].includes('application/json')) {
            if (therapists == false) {
                res.writeHead(403, {
                    "Content-Type": "application/json"
                });
                res.end();
            } else {
                res.writeHead(200, {
                    "Content-Type": "application/json"
                });
                res.end(JSON.stringify(therapists));
            }
        } else {
            //An unsupported request
        }
    });
}

app.post('/therapists', addTherapist)

//Adds the therapist to the database
function addTherapist(req, res) {
    // Username, password, DOB, Weight, Height, (?) Information
    var username = req.body.username
    var unencrypt_password = req.body.password
    therapistDB.add_therapist(username, unencrypt_password, function (worked) {
        if (worked !== false) {
            res.writeHead(200, {
                "Content-Type": "application/json"
            });
            res.end(JSON.stringify({
                token: worked
            }));
        } else {
            res.writeHead(403, {
                "Content-Type": "application/json"
            });
            res.end(JSON.stringify({
                error: "User already exists"
            }));
        }
    });
}

app.get('/therapists/:therapistID', getTherapist)

//Returns the info for a single therapist
function getTherapist(req, res) {
    therapistDB.get_all_patients(req.params.therapistID, function (info) {
        if (req.headers['accept'].includes('text/html')) {
            //Send therapist info as HTML
            res.render('therapist-detail', {
                patients: info,
                therapistID: req.params.therapistID
            });
        } else if (req.headers['accept'].includes('application/json')) {
            if (info === false) {
                res.writeHead(403, {
                    "Content-Type": "application/json"
                });
                res.end();
            } else {
                res.writeHead(200, {
                    "Content-Type": "application/json"
                });
                res.end(JSON.stringify(info));
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
    therapistDB.delete_therapist(therapistDB, function (worked) {
        if (worked) {
            res.writeHead(204, {
                "Content-Type": "application/json"
            });
            res.end();
        } else {
            res.writeHead(end, {
                "Content-Type": "application/json"
            });
            res.end();
        }
    })
    res.send("DELETE Therapist " + req.params['therapistID']);
}

app.get('/therapists/:therapistID/patients', getTherapistPatients)

//Returns the info for all patients of this therapist
function getTherapistPatients(req, res) {
    var therapistID = req.params.therapistID;
    therapistDB.get_all_patients(therapistDB, function (info) {
        if (req.headers['accept'].includes('text/html')) {
            //Send therapist-patient info as HTML
        } else if (req.headers['accept'].includes('application/json')) {
            if (info === false) {
                res.writeHead(403, {
                    "Content-Type": "application/json"
                });
                res.end();
            } else {
                res.writeHead(200, {
                    "Content-Type": "application/json"
                });
                res.end(JSON.stringify(info));
            }
        } else {
            //An unsupported request
        }
    })
    res.send("GET Patients for Therapist " + req.params['therapistID']);
}

app.post('/therapists/:therapistID/patients', addPatientTherapist);

function addPatientTherapist(req, res) {
    var therapistID = req.params.therapistID;
    var patientID = req.body.patientID;
    patientDB.assign_to_therapist(patientID, therapistID, new Date(), function (worked) {
        if (worked) {
            res.writeHead(204, {
                "Content-Type": "application/json"
            });
            res.end();
        } else {
            res.writeHead(403, {
                "Content-Type": "application/json"
            });
            res.end();
        }
    });
}

app.delete('/therapists/:therapistID/patients/:patientID', removePatientTherapist);

function removePatientTherapist(req, res) {
    console.log("here!");
    var therapistID = req.params.therapistID;
    var patientID = req.params.patientID;
    patientDB.unassign_to_therapist(patientID, therapistID, new Date(), function (worked) {
        if (worked) {
            res.writeHead(204, {
                "Content-Type": "application/json"
            });
            res.end();
        } else {
            res.writeHead(403, {
                "Content-Type": "application/json"
            });
            res.end();
        }
    });
}


app.listen(3000, () => console.log('Example app listening on port 3000!'))