//Returns the info for a single therapist
// Request Response TherapistDB -> Void
exports.getTherapist = function (req, res) {
    req.authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            req.responder.report_bad_token(req, res);
            return;
        }
        var therapistID = req.params.therapistID;
        req.authorizer.isAllowed(verified, therapistID, '*', function (err, can_view) {
            if (can_view) {
                req.therapistDB.get_all_patients(therapistID, function (info) {
                    if (info === false) {
                        req.responder.report_not_found(req, res);
                    } else {
                        req.responder.report_sucess(req, res, info, 'therapist/therapist-detail', {
                            patients: info,
                            therapistID: therapistID
                        })
                    }
                });
            } else {
                req.responder.report_not_authorized(req, res);
            }
        });
    });
}

//Deletes this therapist from the database
// Request Response TherapistDB -> Void
exports.deleteTherapist = function (req, res) {
    req.authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            req.responder.report_bad_token(req, res);
            return;
        }
        var therapistID = req.params.therapistID;
        req.authorizer.isAllowed(verified, therapistID, '*', function (err, can_view) {
            if (can_view) {
                req.therapistDB.delete_therapist(therapistID, function (worked) {
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