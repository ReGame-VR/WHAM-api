// Marks the given message as read
// Request Response PatientDB -> Void
exports.markMessageAsRead = function (req, res) {
    req.authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            req.responder.report_bad_token(req, res);
            return;
        }
        var patientID = req.params.patientID;
        var messageID = req.params.messageID;
        req.authorizer.isAllowed(verified, patientID, '*', function (err, can_view) {
            if (can_view) {
                req.patientDB.mark_message_as_read(patientID, messageID, function (worked) {
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

// Returns info about the given message
// Request Response PatientDB -> Void
exports.getMessage = function (req, res) {
    req.authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            req.responder.report_bad_token(req, res);
            return;
        }
        var patientID = req.params.patientID;
        var messageID = req.params.messageID;
        req.authorizer.isAllowed(verified, patientID, '*', function (err, can_view) {
            if (can_view) {
                req.patientDB.get_specific_message(patientID, messageID, function (message_content) {
                    if (message_content === false) {
                        req.responder.report_not_found(req, res);
                    } else {
                        req.responder.report_sucess(req, res, message_content, 'patient/patient-message-detail', message_content)
                    } 
                });
            } else {
                req.responder.report_not_authorized(req, res);
            }
        });
    });
}

// Totally deletes the given message
// Request Response PatientDB -> Void
exports.deletePatientMessage = function (req, res) {
    req.authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            req.responder.report_bad_token(req, res);
            return;
        }
        var patientID = req.params.patientID;
        var messageID = req.params.messageID;
        req.authorizer.isAllowed(verified, patientID, '*', function (err, can_view) {
            if (can_view) {
                req.patientDB.delete_message(patientID, messageID, function (worked) {
                    if (worked) {
                        req.responder.report_sucess_no_info(req, res);
                    } else {
                        req.responder.report_not_found(req, res);
                    }
                })
            } else {
                req.responder.report_not_authorized(req, res);
            }
        });
    });
}

exports.replyToMessage = function (req, res) {
    req.authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            req.responder.report_bad_token(req, res);
            return;
        }
        var patientID = req.params.patientID;
        var messageID = req.params.messageID;
        req.authorizer.isAllowed(verified, patientID, '*', function (err, can_view) {
            if (can_view) {
                req.patientDB.reply_to_message(rea.body.sentID, messageID, req.body.reply_content, new Date(), function (worked) {
                    if (worked) {
                        req.responder.report_sucess_no_info(req, res);
                    } else {
                        req.responder.report_not_found(req, res);
                    }
                })
            } else {
                req.responder.report_not_authorized(req, res);
            }
        });
    });
}