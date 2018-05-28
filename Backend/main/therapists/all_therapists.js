//Gives all therapist info in either JSON or HTML form
exports.getAllTherapists = function(req, res, therapistDB) {
    therapistDB.get_all_therapists(function (therapists) {
        if (req.headers['accept'].includes('text/html')) {
            res.render('therapist-overview', {
                therapists: therapists
            });
        } else if (req.headers['accept'].includes('application/json')) {
            if (therapists == false) {
                res.writeHead(403, {
                    "Content-Type": "application/json"
                });
                res.end();
            } else {
                res.writeHead(200, {
                    "Content-Type": "application/json"
                });
                res.end(JSON.stringify(therapists));
            }
        } else {
            //An unsupported request
        }
    });
}

//Adds the therapist to the database
exports.addTherapist = function(req, res, therapistDB) {
    // Username, password, DOB, Weight, Height, (?) Information
    var username = req.body.username
    var unencrypt_password = req.body.password
    therapistDB.add_therapist(username, unencrypt_password, function (worked) {
        if (worked !== false) {
            res.writeHead(200, {
                "Content-Type": "application/json"
            });
            res.end(JSON.stringify({
                token: worked
            }));
        } else {
            res.writeHead(403, {
                "Content-Type": "application/json"
            });
            res.end(JSON.stringify({
                error: "User already exists"
            }));
        }
    });
}
