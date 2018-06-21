// Returns all message this patient has recieved
// Request Response PatientDB -> Void
exports.getPatientMessages = function (req, res) {
    var patientID = req.params.patientID;
    req.patientDB.get_all_messages_for(patientID).then(messages => {
        var shouldFilter = req.verified !== req.params.patientID && req.verified !== 'admin';
        if (shouldFilter) {
            for (var i = 0; i < messages.length; i += 1) {
                if (messages[i].therapistID !== req.verified) {
                    messages.splice(i, 1);
                }
            }
            requests = [];
        }
        req.responder.report_sucess(req, res, messages, 'patient/patient-message-overview', {
            patientID: patientID,
            messages: messages
        });
    }).catch(error => {
        req.responder.report_not_found(req, res);
    });
}