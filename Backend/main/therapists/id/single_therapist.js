//Returns the info for a single therapist
// Request Response TherapistDB -> Void
exports.getTherapist = function (req, res, therapistDB, authorizer) {
    authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            res.redirect('../login');
            return;
        }
        var therapistID = req.params.therapistID;
        authorizer.isAllowed(verified, therapistID, '*', function (err, can_view) {
            if (can_view) {
                therapistDB.get_all_patients(therapistID, function (info) {
                    if (req.headers['accept'].includes('text/html')) {
                        //Send therapist info as HTML
                        res.render('therapist-detail', {
                            patients: info,
                            therapistID: therapistID
                        });
                    } else if (req.headers['accept'].includes('application/json')) {
                        if (info === false) {
                            res.writeHead(403, {
                                "Content-Type": "application/json"
                            });
                            res.end();
                        } else {
                            res.writeHead(200, {
                                "Content-Type": "application/json"
                            });
                            res.end(JSON.stringify(info));
                        }
                    } else {
                        //An unsupported request
                    }
                });
            } else {
                res.writeHead(403, {
                    "Content-Type": "application/json"
                });
                res.end();
            }
        });
    });
}

//Deletes this therapist from the database
// Request Response TherapistDB -> Void
exports.deleteTherapist = function (req, res, therapistDB, authorizer) {
    authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            res.redirect('../login');
            return;
        }
        var therapistID = req.params.therapistID;
        authorizer.isAllowed(verified, therapistID, '*', function (err, can_view) {
            if (can_view) {
                therapistDB.delete_therapist(therapistID, function (worked) {
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
            } else {
                res.writeHead(403, {
                    "Content-Type": "application/json"
                });
                res.end();
            }
        });
    });
}