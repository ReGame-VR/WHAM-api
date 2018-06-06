// Returns the info for a single patient session
// Request Response PatientDB -> Void
exports.getSession = function (req, res, patientDB, authorizer, responder) {
    authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            responder.report_bad_token(req, res);
            return;
        }
        var patientID = req.params.patientID;
        var sessionID = req.params.sessionID;
        authorizer.isAllowed(verified, patientID, '*', function (err, can_view) {
            if (can_view) {
                patientDB.get_patient_session_specific(patientID, sessionID, function (sessionInfo) {
                    if (sessionInfo === false) {
                        responder.report_not_found(req, res);
                    } else {
                        responder.report_sucess(req, res, sessionInfo, 'patient/patient-session-details', sessionInfo);
                    }    
                });
            } else {
                responder.report_not_authorized(req, res);
            }
        });
    });
}

//Deletes this patient session from the database
// Request Response PatientDB -> Void
exports.deletePatientSession = function (req, res, patientDB, authorizer, responder) {
    authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            responder.report_bad_token(req, res);
            return;
        }
        var patientID = req.params.patientID;
        var sessionID = req.params.sessionID;
        authorizer.isAllowed(verified, patientID, '*', function (err, can_view) {
            if (can_view) {
                patientDB.delete_patient_session(patientID, sessionID, function (worked) {
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