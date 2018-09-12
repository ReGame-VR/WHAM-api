// Marks this therapist-patient pair as expired
// Request Response PatientDb -> Void
exports.removePatientTherapist = function (req, res) {
    var therapistID = req.params.therapistID;
    var patientID = req.params.patientID;
    req.patientDB.unassign_to_therapist(patientID, therapistID, new Date()).then(() => {
            req.responder.report_sucess_no_info(req, res);
    }).catch(error => {
        req.responder.report_not_found(req, res);
    });
}