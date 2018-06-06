//Returns the info for a single therapist
// Request Response TherapistDB -> Void
exports.getTherapist = function (req, res, therapistDB, authorizer, responder) {
    authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            responder.report_bad_token(req, res);
            return;
        }
        var therapistID = req.params.therapistID;
        authorizer.isAllowed(verified, therapistID, '*', function (err, can_view) {
            if (can_view) {
                therapistDB.get_all_patients(therapistID, function (info) {
                    if (info === false) {
                        responder.report_not_found(req, res);
                    } else {
                        responder.report_sucess(req, res, info, 'therapist/therapist-detail', {
                            patients: info,
                            therapistID: therapistID
                        })
                    }
                });
            } else {
                responder.report_not_authorized(req, res);
            }
        });
    });
}

//Deletes this therapist from the database
// Request Response TherapistDB -> Void
exports.deleteTherapist = function (req, res, therapistDB, authorizer, responder) {
    authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            responder.report_bad_token(req, res);
            return;
        }
        var therapistID = req.params.therapistID;
        authorizer.isAllowed(verified, therapistID, '*', function (err, can_view) {
            if (can_view) {
                therapistDB.delete_therapist(therapistID, function (worked) {
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