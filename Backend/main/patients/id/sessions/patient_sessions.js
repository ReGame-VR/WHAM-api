//Returns the info for a patients activity sessions
// Request Response PatientDB -> Void
exports.getPatientSessions = function (req, res) {
    req.patientDB.get_patient_sessions(req.params.patientID, function (sessions) {
        if (sessions === false) {
            req.responder.report_not_found(req, res);
        } else {
            req.responder.report_sucess(req, res, sessions, 'patient/patient-session-overview', {
                username: req.params.patientID,
                sessions: sessions
            });
        }
    });
}

//Adds the session for the given patient to the database
// Request Response PatientDB -> Void
exports.addPatientSession = function (req, res) {
    req.patientDB.add_patient_session(req.params.patientID, req.body.score, req.body.time, function (worked) {
        if (worked) {
            req.responder.report_sucess_no_info(req, res);
        } else {
            req.responder.report_not_found(req, res);
        }
    });
}