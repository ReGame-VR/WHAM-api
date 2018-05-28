//Returns the info for a single therapist
exports.getTherapist = function(req, res, therapistDB) {
    therapistDB.get_specific_therapist(req.params.therapistID, function (info) {
        if (req.headers['accept'].includes('text/html')) {
            //Send therapist info as HTML
            res.render('therapist-detail', {
                patients: info,
                therapistID: req.params.therapistID
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
}

//Deletes this therapist from the database
exports.deleteTherapist = function(req, res, therapistDB) {
    var therapistID = req.params.therapistID;
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
    })
}