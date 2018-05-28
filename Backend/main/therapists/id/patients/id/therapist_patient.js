exports.removePatientTherapist = function(req, res, patientDB) {
    var therapistID = req.params.therapistID;
    var patientID = req.params.patientID;
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