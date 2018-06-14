// Returns every message this therapist has sent
// Request Response TherapistDB -> Void
exports.getMessagesFromTherapist = function (req, res) {
    var therapistID = req.params.therapistID;
    req.therapistDB.get_all_messages_from(therapistID, function (messages) {
        if (messages === false) {
            req.responder.report_not_found(req, res);
        } else {
            req.responder.report_sucess(req, res, messages, "therapist/therapist-messages", {
                therapistID: therapistID,
                messages: messages
            });
        }
    });
}

// Sends the given message to the patient
// Request Response PatientDB -> Void
exports.addPatientMessage = function (req, res) {
    var patientID = req.body.patientID;
    var therapistID = req.params.therapistID;
    var message_content = req.body.message_content;
    var date_sent = new Date(req.body.date_sent);
    req.patientDB.send_patient_a_message(patientID, therapistID, message_content, date_sent, function (worked) {
        if (worked !== false) {
            req.authorizer.allow(therapistID, " message " + worked, '*') // this user can do anything to themselves they want
            req.authorizer.allow(patientID, " message " + worked, '*') // this user can do anything to themselves they want
            req.responder.report_sucess_no_info(req, res);
        } else {
            req.responder.report_not_found(req, res);
        }
    });
}