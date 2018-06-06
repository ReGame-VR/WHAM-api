// Marks the given message as read
// Request Response PatientDB -> Void
exports.markMessageAsRead = function (req, res, patientDB, authorizer, responder) {
    authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            responder.report_bad_token(req, res);
            return;
        }
        var patientID = req.params.patientID;
        var messageID = req.params.messageID;
        authorizer.isAllowed(verified, patientID, '*', function (err, can_view) {
            if (can_view) {
                patientDB.mark_message_as_read(patientID, messageID, function (worked) {
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

// Returns info about the given message
// Request Response PatientDB -> Void
exports.getMessage = function (req, res, patientDB, authorizer, responder) {
    authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            responder.report_bad_token(req, res);
            return;
        }
        var patientID = req.params.patientID;
        var messageID = req.params.messageID;
        authorizer.isAllowed(verified, patientID, '*', function (err, can_view) {
            if (can_view) {
                patientDB.get_specific_message(patientID, messageID, function (message_content) {
                    if (message_content === false) {
                        responder.report_not_found(req, res);
                    } else {
                        responder.report_sucess(req, res, message_content, 'patient/patient-message-detail', message_content)
                    } 
                });
            } else {
                responder.report_not_authorized(req, res);
            }
        });
    });
}

// Totally deletes the given message
// Request Response PatientDB -> Void
exports.deletePatientMessage = function (req, res, patientDB, authorizer, responder) {
    authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            responder.report_bad_token(req, res);
            return;
        }
        var patientID = req.params.patientID;
        var messageID = req.params.messageID;
        authorizer.isAllowed(verified, patientID, '*', function (err, can_view) {
            if (can_view) {
                patientDB.delete_message(patientID, messageID, function (worked) {
                    if (worked) {
                        responder.report_sucess_no_info(req, res);
                    } else {
                        responder.report_not_found(req, res);
                    }
                })
            } else {
                responder.report_not_authorized(req, res);
            }
        });
    });
}