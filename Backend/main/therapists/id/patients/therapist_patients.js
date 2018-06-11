//Returns the info for all patients of this therapist
// Request Response TherapistDB -> Void
exports.getTherapistPatients = function (req, res) {
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
                        req.responder.report_sucess(req, res, info, 'patient/patient-overview', {
                            patients: info
                        });
                    }
                });
            } else {
                req.responder.report_not_authorized(req, res);
            }
        });
    });
}

// Adds the given patient to this patient-therapist pair
// Request Response PatientDB -> Void
exports.addPatientTherapist = function (req, res) {
    req.authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            req.responder.report_bad_token(req, res);
            return;
        }
        var therapistID = req.params.therapistID;
        var patientID = req.body.patientID;
        req.authorizer.isAllowed(verified, therapistID, '*', function (err, can_view) {
            if (can_view) {
                req.patientDB.assign_to_therapist(patientID, therapistID, new Date(), function (worked) {
                    if (worked) {
                        req.responder.report_sucess_no_info(req, res);
                    } else {
                        req.responder.report_not_found(req, res);
                    }
                });
            } else {
                req.responder.report_not_authorized(req, res);
            }
        })
    });
}