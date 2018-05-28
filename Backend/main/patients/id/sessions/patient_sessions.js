//Returns the info for a patients activity sessions
exports.getPatientSessions = function(req, res, patientDB) {
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

//Adds the session for the given patient to the database
exports.addPatientSession = function(req, res, patientDB) {
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