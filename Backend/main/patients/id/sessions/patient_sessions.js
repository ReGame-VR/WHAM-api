//Returns the info for a patients activity sessions
// Request Response PatientDB -> Void
exports.getPatientSessions = function (req, res, patientDB, authorizer) {
    authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            res.redirect(req.baseUrl + '/login');
            return;
        }
        var patientID = req.params.patientID;
        authorizer.isAllowed(verified, patientID, '*', function (err, can_view) {
            if (can_view) {
                patientDB.get_patient_sessions(patientID, function (sessions) {
                    if (req.headers['accept'].includes('text/html')) {
                        res.render('patient/patient-session-overview', {
                            username: patientID,
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
            } else {
                authorizer.report_not_authorized(req, res);
            }
        });
    });
}

//Adds the session for the given patient to the database
// Request Response PatientDB -> Void
exports.addPatientSession = function (req, res, patientDB, authorizer) {
    authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            res.redirect(req.baseUrl + '/login');
            return;
        }
        var patientID = req.params.patientID;
        var score = req.body.score;
        var time = req.body.time;
        authorizer.isAllowed(verified, patientID, '*', function (err, can_view) {
            if (can_view) {
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
            } else {
                authorizer.report_not_authorized(req, res);
            }
        });
    });
}