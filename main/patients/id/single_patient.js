//Returns the info for a single patient
// Request Response PatientDB -> Void
exports.getPatient = function (req, res) {
    req.patientDB.get_patient_info(req.params.patientID).then(([info, sessions, messages, requests]) => {
            var shouldFilter = req.verified !== req.params.patientID && req.verified !== 'admin';
            if(shouldFilter) {
                for(var i = 0; i < messages.length; i += 1) {
                    if(messages[i].therapistID !== req.verified) {
                        messages.splice(i, 1);
                    }
                }
                requests = [];
            }
            var realSessions = [];
            var lastID = undefined
            var curSessionItems = []
            for(var i = 0; i < sessions.length; i++) {
                if(lastID == undefined || sessions[i].sessionID !== lastID) {
                    if(lastID != undefined) {
                        realSessions.push({
                            sessionID: lastID,
                            scores: curSessionItems
                        })
                    }
                    lastID = sessions[i].sessionID
                }
                curSessionItems.push({
                    score: sessions[i].score,
                    time: sessions[i].time
                })
            }
            if(lastID != undefined) {
                realSessions.push({
                    sessionID: lastID,
                    scores: curSessionItems
                })
            }
            req.responder.report_sucess(req, res, {
                info: info,
                sessions: sessions,
                messages: messages,
                requests: requests
            }, 'patient/patient-detail', {
                info: info,
                sessions: realSessions,
                messages: messages,
                requests: requests
            })
    }).catch(error => {
        req.responder.report_not_found(req, res);
    })
}

//Deletes this patient from the database
// Request Response PatientDB -> Void
exports.deletePatient = function (req, res) {
    req.patientDB.delete_patient(req.params.patientID).then(() => {
        req.responder.report_sucess_no_info(req, res);
    }).catch(error => {
        req.responder.report_not_found(req, res);
    });
}
