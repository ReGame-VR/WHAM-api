//Returns the info for all patients of this therapist
// Request Response TherapistDB -> Void
exports.getTherapistPatients = function (req, res, therapistDB) {
    var therapistID = req.params.therapistID;
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
    })
}

// Adds the given patient to this patient-therapist pair
// Request Response PatientDB -> Void
exports.addPatientTherapist = function (req, res, patientDB, authorizer) {
    var therapistID = req.params.therapistID;
    var patientID = req.body.patientID;
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
}