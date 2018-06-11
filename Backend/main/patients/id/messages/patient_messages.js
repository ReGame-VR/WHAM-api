// Sends the given message to the patient
// Request Response PatientDB -> Void
exports.addPatientMessage = function (req, res) {
    req.authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            req.responder.report_bad_token(req, res);
            return;
        }
        var patientID = req.params.patientID;
        var therapistID = req.body.therapistID;
        var message_content = req.body.message_content;
        var date_sent = req.body.date_sent;
        req.authorizer.isAllowed(verified, patientID, '*', function (err, can_view) {
            if (can_view) {
                req.patientDB.send_patient_a_message(patientID, therapistID, message_content, date_sent, function (worked) {
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

// Returns all message this patient has recieved
// Request Response PatientDB -> Void
exports.getPatientMessages = function (req, res) {
    req.authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            req.responder.report_bad_token(req, res);
            return;
        }
        var patientID = req.params.patientID;
        req.authorizer.isAllowed(verified, patientID, '*', function (err, can_view) {
            if (can_view) {
                req.patientDB.get_all_messages_for(patientID, function (messages) {
                    if (messages === false) {
                        req.responder.report_not_found(req, res);
                    } else {
                        req.responder.report_sucess(req, res, messages, 'patient/patient-message-overview', {
                            patientID: patientID,
                            messages: messages
                        });
                    }
                });
            } else {
                req.responder.report_not_authorized(req, res);
            }
        });
    });
}