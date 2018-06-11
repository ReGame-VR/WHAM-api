//Returns the info for a single patient
// Request Response PatientDB -> Void
exports.getPatient = function (req, res) {
    req.authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            req.responder.report_bad_token(req, res);
            return;
        }
        var id = req.params.patientID
        req.authorizer.isAllowed(verified, id, '*', function (err, can_view) {
            if (can_view) {
                req.patientDB.get_patient_info(id, function (info, sessions, messages, requests) {
                    if (info === false) {
                        req.responder.report_not_found(req, res);
                    } else {
                        var realSessions = [];
                        for (var i = 0; i < sessions.length; i += 1) {
                            realSessions.push([sessions[i].time, sessions[i].score]);
                        }
                        req.responder.report_sucess(req, res, {
                            info: info,
                            sessions: sessions,
                            messages: messages,
                            requests: requests
                        }, 'patient/patient-detail', {
                            info: info,
                            sessions: realSessions,
                            messages: messages,
                            requests: requests
                        })
                    }
                });
            } else {
                req.responder.report_not_authorized(req, res);
            }
        });
    });
}

//Deletes this patient from the database
// Request Response PatientDB -> Void
exports.deletePatient = function (req, res) {
    req.authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            req.responder.report_bad_token(req, res);
            return;
        }
        req.authorizer.isAllowed(verified, req.params.patientID, '*', function (err, can_view) {
            if (can_view) {
                req.patientDB.delete_patient(req.params.patientID, function (worked) {
                    if (worked === false) {
                        req.responder.report_not_found(req, res);
                    } else {
                        req.responder.report_sucess_no_info(req, res);
                    }
                });
            } else {
                req.responder.report_not_authorized(req, res);
            }
        });
    });
}