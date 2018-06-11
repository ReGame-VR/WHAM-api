//Returns the info for a patients activity sessions
// Request Response PatientDB -> Void
exports.getPatientSessions = function (req, res) {
    req.authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            req.responder.report_bad_token(req, res);
            return;
        }
        var patientID = req.params.patientID;
        req.authorizer.isAllowed(verified, patientID, '*', function (err, can_view) {
            if (can_view) {
                req.patientDB.get_patient_sessions(patientID, function (sessions) {
                    if (sessions === false) {
                        req.responder.report_not_found(req, res);
                    } else {
                        req.responder.report_sucess(req, res, sessions, 'patient/patient-session-overview', {
                            username: patientID,
                            sessions: sessions
                        });
                    }
                });
            } else {
                req.responder.report_not_authorized(req, res);
            }
        });
    });
}

//Adds the session for the given patient to the database
// Request Response PatientDB -> Void
exports.addPatientSession = function (req, res) {
    req.authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            req.responder.report_bad_token(req, res);
            return;
        }
        var patientID = req.params.patientID;
        var score = req.body.score;
        var time = req.body.time;
        req.authorizer.isAllowed(verified, patientID, '*', function (err, can_view) {
            if (can_view) {
                req.patientDB.add_patient_session(patientID, score, time, function (worked) {
                    if (worked) {
                        req.responder.report_sucess_no_info(req, res);
                    } else {
                        req.responder.report_not_found(req, res);
                    }
                });
            } else {
                req.responder.report_not_authorized(req, res);
            }
        });
    });
}