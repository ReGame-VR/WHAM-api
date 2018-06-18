// Marks this therapist-patient pair as expired
// Request Response PatientDb -> Void
exports.removePatientTherapist = function (req, res) {
    var therapistID = req.params.therapistID;
    var patientID = req.params.patientID;
    req.patientDB.unassign_to_therapist(patientID, therapistID, new Date()).then(() => {
            req.authorizer.removeAllow(therapistID, patientID, "*");
            req.responder.report_sucess_no_info(req, res);
    }).catch(error => {
        req.responder.report_not_found(req, res);
    });
}

exports.acceptPair = function (req, res) {
    var therapistID = req.params.therapistID;
    var patientID = req.params.patientID;
    req.patientDB.accept_therapist_request(patientID, therapistID).then(() => {
        req.authorizer.allow(therapistID, patientID, '*') // this user can do anything to this patient they want
        req.responder.report_sucess_no_info(req, res);
    }).catch(error => {
        req.responder.report_not_found(req, res);
    });
}