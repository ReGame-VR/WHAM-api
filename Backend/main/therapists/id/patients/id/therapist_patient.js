// Marks this therapist-patient pair as expired
// Request Response PatientDb -> Void
exports.removePatientTherapist = function (req, res, patientDB, authorizer) {
    authorizer.verifyJWT(req.query.auth_token, function (verified) {
        if (!verified) {
            res.writeHead(403, {
                "Content-Type": "application/json"
            });
            res.end();
            return;
        }
        var therapistID = req.params.therapistID;
        var patientID = req.params.patientID;
        authorizer.isAllowed(verified, patientID, '*', function (err, can_view) {
            if (can_view) {
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
            } else {
                res.writeHead(403, {
                    "Content-Type": "application/json"
                });
                res.end();
            }
        });
    });
}