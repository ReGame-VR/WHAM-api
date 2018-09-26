// Returns every message this therapist has sent
// Request Response TherapistDB -> Void
exports.getMessagesFromTherapist = function (req, res) {
    var therapistID = req.params.therapistID;
    req.messageDB.get_all_messages_from(therapistID).then(messages => {
        req.responder.report_sucess(req, res, messages, "therapist/therapist-messages", {
            therapistID: therapistID,
            messages: messages
        });
    }).catch(error => {
        req.responder.report_not_found(req, res);
    });
}

// Sends the given message to the patient
// Request Response PatientDB -> Void
exports.addPatientMessage = function (req, res) {
    var patientID = req.body.patientID;
    var therapistID = req.params.therapistID;
    var message_content = req.body.message_content;
    var date_sent = new Date(req.body.date_sent);
    req.messageDB.send_patient_a_message(patientID, therapistID, message_content, date_sent).then((messageID) => {
        req.responder.report_sucess_with_info(req, res, {
            messageID: messageID
        })
    }).catch(error => {
        req.responder.report_not_found(req, res);
    });
}