//Returns the info for a patients activity sessions
// Request Response PatientDB -> Void
exports.getPatientSessions = function (req, res, patientDB, authorizer, responder) {
    authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            responder.report_bad_token(req, res);
            return;
        }
        var patientID = req.params.patientID;
        authorizer.isAllowed(verified, patientID, '*', function (err, can_view) {
            if (can_view) {
                patientDB.get_patient_sessions(patientID, function (sessions) {
                    if (sessions === false) {
                        responder.report_not_found(req, res);
                    } else {
                        responder.report_sucess(req, res, sessions, 'patient/patient-session-overview', {
                            username: patientID,
                            sessions: sessions
                        });
                    }
                });
            } else {
                responder.report_not_authorized(req, res);
            }
        });
    });
}

//Adds the session for the given patient to the database
// Request Response PatientDB -> Void
exports.addPatientSession = function (req, res, patientDB, authorizer, responder) {
    authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            responder.report_bad_token(req, res);
            return;
        }
        var patientID = req.params.patientID;
        var score = req.body.score;
        var time = req.body.time;
        authorizer.isAllowed(verified, patientID, '*', function (err, can_view) {
            if (can_view) {
                patientDB.add_patient_session(patientID, score, time, function (worked) {
                    if (worked) {
                        responder.report_sucess_no_info(req, res);
                    } else {
                        responder.report_not_found(req, res);
                    }
                });
            } else {
                responder.report_not_authorized(req, res);
            }
        });
    });
}