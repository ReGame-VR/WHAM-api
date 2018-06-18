// Returns all message this patient has recieved
// Request Response PatientDB -> Void
exports.getPatientMessages = function (req, res) {
    var patientID = req.params.patientID;
    req.patientDB.get_all_messages_for(patientID).then(messages => {
        req.responder.report_sucess(req, res, messages, 'patient/patient-message-overview', {
            patientID: patientID,
            messages: messages
        });
    }).catch(error => {
        req.responder.report_not_found(req, res);
    });
}