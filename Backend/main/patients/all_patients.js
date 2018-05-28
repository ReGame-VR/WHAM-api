//Gives all patient info in either JSON or HTML form
exports.getPatients = function(req, res, patientDB, authorizer) {
    if (req.query === undefined || req.query.auth_token === undefined) {
        if (req.headers['accept'].includes('text/html')) {
            show_login(req, res);
        } else {
            res.writeHead(403, {
                "Content-Type": "application/json"
            });
            res.end();
        }
    } else {
        authorizer.get_auth_level(req.query.auth_token, "PATIENT", function (auth_level, username) {
            if (auth_level !== "3") {
                if (req.headers['accept'].includes('text/html')) {
                    show_login(req, res);
                } else {
                    res.writeHead(403, {
                        "Content-Type": "application/json"
                    });
                    res.end();
                }
            } else {
                patientDB.get_all_patient_info(function (info) {
                    if (req.headers['accept'].includes('text/html')) {
                        //Send therapist info as HTML
                        res.render('patient-overview', {
                            patients: info
                        });
                    } else if (req.headers['accept'].includes('application/json')) {
                        res.writeHead(200, {
                            "Content-Type": "application/json"
                        });
                        res.end(JSON.stringify(info));
                    } else {
                        res.writeHead(403);
                        res.end();
                    }
                });
            }
        });
    }
}

//Adds the patient to the database
exports.addPatient = function(req, res, patientDB) {
    var username = req.body.username
    if (username.includes(" ")) {
        res.writeHead(403, {
            "Content-Type": "application/json"
        });
        res.end(JSON.stringify({
            error: "User already exists"
        }));
        return;
    }
    var unencrypt_password = req.body.password
    var dob = req.body.dob
    var weight = req.body.weight
    var height = req.body.height
    var information = req.body.information
    patientDB.add_patient(username, unencrypt_password, dob, weight, height, information, function (worked) {
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