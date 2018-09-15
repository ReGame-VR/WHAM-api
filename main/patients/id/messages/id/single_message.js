// Marks the given message as read
// Request Response PatientDB -> Void
exports.markMessageAsRead = function (req, res) {
    var patientID = req.params.patientID;
    var messageID = req.params.messageID;
    req.messageDB.mark_message_as_read(patientID, messageID).then(() => {
        req.responder.report_sucess_no_info(req, res);
    }).catch(error => {
        req.responder.report_not_found(req, res);
    });
}

// Returns info about the given message
// Request Response PatientDB -> Void
exports.getMessage = function (req, res) {
    var patientID = req.params.patientID;
    var messageID = req.params.messageID;
    req.messageDB.get_specific_message(patientID, messageID).then(message_content => {
        var html_message_content = message_content;
        html_message_content.viewerID = req.verified;
        req.responder.report_sucess(req, res, message_content, 'patient/patient-message-detail', html_message_content)
    }).catch(error => {
        req.responder.report_not_found(req, res);
    });
}

// Totally deletes the given message
// Request Response PatientDB -> Void
exports.deletePatientMessage = function (req, res) {
    var patientID = req.params.patientID;
    var messageID = req.params.messageID;
    req.messageDB.delete_message(patientID, messageID).then(() => {
        req.responder.report_sucess_no_info(req, res);
    }).catch(error => {
        req.responder.report_not_found(req, res);
    });
}

exports.replyToMessage = function (req, res) {
    var patientID = req.params.patientID;
    var messageID = req.params.messageID;
    var date_sent = new Date(req.body.date_sent);
    req.messageDB.reply_to_message(req.body.sentID, messageID, req.body.reply_content, date_sent).then(() => {
        req.responder.report_sucess_no_info(req, res);
    }).catch(error => {
        req.responder.report_not_found(req, res);
    });
}