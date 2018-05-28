// Marks this therapist-patient pair as expired
// Request Response PatientDb -> Void
exports.removePatientTherapist = function (req, res, patientDB, authorizer) {
    var therapistID = req.params.therapistID;
    var patientID = req.params.patientID;
    if (req.query === undefined || req.query.auth_token === undefined) {
        res.writeHead(403, {
            "Content-Type": "application/json"
        });
        res.end();
    } else {
        authorizer.can_view_patient_and_edit_join_and_messages(req.query.auth_token, patientID, function (can_view) {
            if (!can_view) {
                res.writeHead(403, {
                    "Content-Type": "application/json"
                });
                res.end();
            } else {
                patientDB.unassign_to_therapist(patientID, therapistID, new Date(), function (worked) {
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
            }
        });
    }
}