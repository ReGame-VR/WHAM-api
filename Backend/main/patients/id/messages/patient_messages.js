// Sends the given message to the patient
// Request Response PatientDB -> Void
exports.addPatientMessage = function(req, res, patientDB) {
    var patientID = req.params.patientID;
    var therapistID = req.body.therapistID;
    var message_content = req.body.message_content;
    var date_sent = req.body.date_sent;
    patientDB.send_patient_a_message(patientID, therapistID, message_content, date_sent, function (worked) {
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

// Returns all message this patient has recieved
// Request Response PatientDB -> Void
exports.getPatientMessages = function(req, res, patientDB) {
    var patientID = req.params.patientID;
    patientDB.get_all_messages_for(patientID, function(messages) {
        if (req.headers['accept'].includes('text/html')) {
            res.send("Getting these messages");
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
    });
}