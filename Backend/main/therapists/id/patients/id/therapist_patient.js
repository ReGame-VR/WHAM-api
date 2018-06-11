// Marks this therapist-patient pair as expired
// Request Response PatientDb -> Void
exports.removePatientTherapist = function(req, res) {
    req.authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            req.responder.report_bad_token(req, res);
            return;
        }
        var therapistID = req.params.therapistID;
        var patientID = req.params.patientID;
        req.authorizer.isAllowed(verified, patientID, '*', function (err, can_view) {
            if (can_view) {
                req.patientDB.unassign_to_therapist(patientID, therapistID, new Date(), function (worked) {
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

exports.acceptPair = function(req, res) {
    req.authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            req.responder.report_bad_token(req, res);
            return;
        }
        var therapistID = req.params.therapistID;
        var patientID = req.params.patientID;
        req.authorizer.isAllowed(verified, patientID, '*', function (err, can_view) {
            if (can_view) {
                req.patientDB.accept_therapist_request(patientID, therapistID, function (worked) {
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