exports.getMessagesFromTherapist = function(req, res, therapistDB) {
    var therapistID = req.params.therapistID;
    therapistDB.get_all_messages_from(therapistID, function (messages) {
        if (req.headers['accept'].includes('text/html')) {
            //Send therapist-patient info as HTML
        } else if (req.headers['accept'].includes('application/json')) {
            if (messages === false) {
                res.writeHead(403, {
                    "Content-Type": "application/json"
                });
                res.end();
            } else {
                res.writeHead(200, {
                    "Content-Type": "application/json"
                });
                res.end(JSON.stringify(messages));
            }
        } else {
            //An unsupported request
        }
    })
}