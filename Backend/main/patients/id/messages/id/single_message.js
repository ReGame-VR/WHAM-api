// Marks the given message as read
// Request Response PatientDB -> Void
exports.markMessageAsRead = function (req, res) {
    var patientID = req.params.patientID;
    var messageID = req.params.messageID;
    req.patientDB.mark_message_as_read(patientID, messageID, function (worked) {
        if (worked) {
            req.responder.report_sucess_no_info(req, res);
        } else {
            req.responder.report_not_found(req, res);
        }
    });
}

// Returns info about the given message
// Request Response PatientDB -> Void
exports.getMessage = function (req, res) {
    var patientID = req.params.patientID;
    var messageID = req.params.messageID;
    req.patientDB.get_specific_message(patientID, messageID, function (message_content) {
        if (message_content === false) {
            req.responder.report_not_found(req, res);
        } else {
            req.responder.report_sucess(req, res, message_content, 'patient/patient-message-detail', message_content)
        }
    });
}

// Totally deletes the given message
// Request Response PatientDB -> Void
exports.deletePatientMessage = function (req, res) {
    var patientID = req.params.patientID;
    var messageID = req.params.messageID;
    req.patientDB.delete_message(patientID, messageID, function (worked) {
        if (worked) {
            req.responder.report_sucess_no_info(req, res);
        } else {
            req.responder.report_not_found(req, res);
        }
    });
}

exports.replyToMessage = function (req, res) {
    var patientID = req.params.patientID;
    var messageID = req.params.messageID;
    var date_sent = req.body.date_sent;
    req.patientDB.reply_to_message(req.body.sentID, messageID, req.body.reply_content, date_sent, function (worked) {
        if (worked) {
            req.responder.report_sucess_no_info(req, res);
        } else {
            req.responder.report_not_found(req, res);
        }
    });
}