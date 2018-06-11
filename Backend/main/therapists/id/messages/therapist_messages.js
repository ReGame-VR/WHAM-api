// Returns every message this therapist has sent
// Request Response TherapistDB -> Void
exports.getMessagesFromTherapist = function (req, res) {
    req.authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            req.responder.report_bad_token(req, res);
            return;
        }
        var therapistID = req.params.therapistID;
        req.authorizer.isAllowed(verified, therapistID, '*', function (err, can_view) {
            if (can_view) {
                req.therapistDB.get_all_messages_from(therapistID, function (messages) {
                    if (messages === false) {
                        req.responder.report_not_found(req, res);
                    } else {
                        req.responder.report_sucess(req, res, messages,"therapist/therapist-messages", {
                            therapistID: therapistID,
                            messages: messages
                        });
                    }
                })
            } else {
                req.responder.report_not_authorized(req, res);
            }
        });
    });
}