exports.acceptPair = function (req, res) {
    var therapistID = req.params.therapistID;
    var patientID = req.params.patientID;
    if (req.verified !== patientID && req.verified !== 'admin') {
        req.responder.report_not_found(req, res);
    } else {
        req.requestDB.accept_therapist_request(patientID, therapistID).then(() => {
            req.responder.report_sucess_no_info(req, res);
        }).catch(error => {
            req.responder.report_not_found(req, res);
        });
    }
}