// Marks the given message as read
// Request Response PatientDB -> Void
exports.markMessageAsRead = function(req, res, patientDB) {
    var patientID = req.params.patientID;
    var messageID = req.params.messageID;
    patientDB.mark_message_as_read(patientID, messageID, function (worked) {
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

// Returns info about the given message
// Request Response PatientDB -> Void
exports.getMessage = function(req, res, patientDB) {
    var patientID = req.params.patientID;
    var messageID = req.params.messageID;
    patientDB.get_specific_message(patientID, messageID, function(message_content) {
        if (req.headers['accept'].includes('text/html')) {
            res.send("Getting this message");
        } else if (req.headers['accept'].includes('application/json')) {
            if (message_content === false) {
                res.writeHead(403, {
                    "Content-Type": "application/json"
                });
                res.end();
            } else {
                res.writeHead(200, {
                    "Content-Type": "application/json"
                });
                res.end(JSON.stringify(message_content));
            }
        } else {
            //An unsupported request
        }
    });
}

// Totally deletes the given message
// Request Response PatientDB -> Void
exports.deletePatientMessage = function(req, res, patientDB) {
    var patientID = req.params.patientID;
    var messageID = req.params.messageID;
    patientDB.delete_message(patientID, messageID, function(worked) {
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
    })
}