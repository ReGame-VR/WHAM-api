// Returns every message this therapist has sent
// Request Response TherapistDB -> Void
exports.getMessagesFromTherapist = function (req, res, therapistDB, authorizer, responder) {
    authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            responder.report_bad_token(req, res);
            return;
        }
        var therapistID = req.params.therapistID;
        authorizer.isAllowed(verified, therapistID, '*', function (err, can_view) {
            if (can_view) {
                therapistDB.get_all_messages_from(therapistID, function (messages) {
                    if (messages === false) {
                        responder.report_not_found(req, res);
                    } else {
                        responder.report_sucess(req, res, messages,"therapist/therapist-messages", {
                            therapistID: therapistID,
                            messages: messages
                        });
                    }
                })
            } else {
                responder.report_not_authorized(req, res);
            }
        });
    });
}