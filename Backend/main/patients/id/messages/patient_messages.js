// Sends the given message to the patient
// Request Response PatientDB -> Void
exports.addPatientMessage = function (req, res) {
    var patientID = req.params.patientID;
    var therapistID = req.body.therapistID;
    var message_content = req.body.message_content;
    var date_sent = req.body.date_sent;
    req.patientDB.send_patient_a_message(patientID, therapistID, message_content, date_sent, function (worked) {
        if (worked !== false) {
            req.authorizer.allow(therapistID, " message " + worked.messageID, '*') // this user can do anything to themselves they want
            req.authorizer.allow(patientID, " message " + worked.messageID, '*') // this user can do anything to themselves they want
            req.responder.report_sucess_no_info(req, res);
        } else {
            req.responder.report_not_found(req, res);
        }
    });
}

// Returns all message this patient has recieved
// Request Response PatientDB -> Void
exports.getPatientMessages = function (req, res) {
    var patientID = req.params.patientID;
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
}