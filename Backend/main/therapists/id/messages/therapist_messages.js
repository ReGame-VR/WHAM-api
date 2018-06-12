// Returns every message this therapist has sent
// Request Response TherapistDB -> Void
exports.getMessagesFromTherapist = function (req, res) {
    var therapistID = req.params.therapistID;
    req.therapistDB.get_all_messages_from(therapistID, function (messages) {
        if (messages === false) {
            req.responder.report_not_found(req, res);
        } else {
            req.responder.report_sucess(req, res, messages, "therapist/therapist-messages", {
                therapistID: therapistID,
                messages: messages
            });
        }
    });
}