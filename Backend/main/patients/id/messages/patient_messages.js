// Sends the given message to the patient
// Request Response PatientDB -> Void
exports.addPatientMessage = function (req, res, patientDB, authorizer, responder) {
    authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            responder.report_bad_token(req, res);
            return;
        }
        var patientID = req.params.patientID;
        var therapistID = req.body.therapistID;
        var message_content = req.body.message_content;
        var date_sent = req.body.date_sent;
        authorizer.isAllowed(verified, patientID, '*', function (err, can_view) {
            if (can_view) {
                patientDB.send_patient_a_message(patientID, therapistID, message_content, date_sent, function (worked) {
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

// Returns all message this patient has recieved
// Request Response PatientDB -> Void
exports.getPatientMessages = function (req, res, patientDB, authorizer, responder) {
    authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            responder.report_bad_token(req, res);
            return;
        }
        var patientID = req.params.patientID;
        authorizer.isAllowed(verified, patientID, '*', function (err, can_view) {
            if (can_view) {
                patientDB.get_all_messages_for(patientID, function (messages) {
                    if (messages === false) {
                        responder.report_not_found(req, res);
                    } else {
                        responder.report_sucess(req, res, messages, 'patient/patient-message-overview', {
                            patientID: patientID,
                            messages: messages
                        });
                    }
                });
            } else {
                responder.report_not_authorized(req, res);
            }
        });
    });
}