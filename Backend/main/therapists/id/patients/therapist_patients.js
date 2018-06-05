//Returns the info for all patients of this therapist
// Request Response TherapistDB -> Void
exports.getTherapistPatients = function (req, res, therapistDB, authorizer) {
    authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            res.redirect('../login');
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
                            res.writeHead(403);
                            res.end();
                        } else {
                            res.writeHead(200, {
                                "Content-Type": "application/json"
                            });
                            res.end(JSON.stringify(info));
                        }
                    } else {
                        //An unsupported request
                    }
                });
            } else {
                authorizer.report_not_authorized(req, res);
            }
        });
    });
}

// Adds the given patient to this patient-therapist pair
// Request Response PatientDB -> Void
exports.addPatientTherapist = function (req, res, patientDB, authorizer) {
    authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            res.redirect('../login');
            return;
        }
        var therapistID = req.params.therapistID;
        var patientID = req.body.patientID;
        authorizer.isAllowed(verified, therapistID, '*', function (err, can_view) {
            if (can_view) {
                patientDB.assign_to_therapist(patientID, therapistID, new Date(), function (worked) {
                    if (worked) {
                        res.writeHead(204, {
                            "Content-Type": "application/json"
                        });
                        res.end();
                    } else {
                        res.writeHead(403, {
                            "Content-Type": "application/json"
                        });
                        res.end();
                    }
                });
            } else {
                authorizer.report_not_authorized(req, res);
            }
        })
    });
}