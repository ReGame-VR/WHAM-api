//Returns the info for all patients of this therapist
// Request Response TherapistDB -> Void
exports.getTherapistPatients = function (req, res, therapistDB, authorizer, responder) {
    authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            responder.report_bad_token(req, res);
            return;
        }
        var therapistID = req.params.therapistID;
        authorizer.isAllowed(verified, therapistID, '*', function (err, can_view) {
            if (can_view) {
                therapistDB.get_all_patients(therapistID, function (info) {
                    if (req.headers['accept'].includes('text/html')) {
                        //Send therapist-patient info as HTML
                    } else if (req.headers['accept'].includes('application/json')) {
                        if (info === false) {
                            responder.report_not_found(req, res);
                        } else {
                            responder.report_sucess_with_info(req, res, info);
                        }
                    }
                });
            } else {
                responder.report_not_authorized(req, res);
            }
        });
    });
}

// Adds the given patient to this patient-therapist pair
// Request Response PatientDB -> Void
exports.addPatientTherapist = function (req, res, patientDB, authorizer, responder) {
    authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            responder.report_bad_token(req, res);
            return;
        }
        var therapistID = req.params.therapistID;
        var patientID = req.body.patientID;
        authorizer.isAllowed(verified, therapistID, '*', function (err, can_view) {
            if (can_view) {
                patientDB.assign_to_therapist(patientID, therapistID, new Date(), function (worked) {
                    if (worked) {
                        responder.report_sucess_no_info(req, res);
                    } else {
                        responder.report_not_found(req, res);
                    }
                });
            } else {
                responder.report_not_authorized(req, res);
            }
        })
    });
}