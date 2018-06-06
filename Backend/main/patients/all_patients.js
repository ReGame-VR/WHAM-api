// Gives all patient info in either JSON or HTML form
// Request Response PatientDB AuthorizationDB -> Void
exports.getPatients = function (req, res, patientDB, authorizer, responder) {
    authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            responder.report_bad_token(req, res);
            return;
        }
        authorizer.isAllowed(verified, "/ patients", '*', function (err, can_view) {
            if (can_view) {
                patientDB.get_all_patient_info(function (info) {
                    if (req.headers['accept'].includes('text/html')) {
                        //Send therapist info as HTML
                        responder.render(req, res, 'patient/patient-overview', {
                            patients: info
                        })
                    } else if (req.headers['accept'].includes('application/json')) {
                        responder.report_sucess_with_info(req, res, info);
                    } else {
                        responder.report_not_found(req, res);
                    }
                });
            } else {
                responder.report_not_authorized(req, res);
            }
        });
    });
}


// Adds the patient to the database
// Request Response PatientDB -> Void
exports.addPatient = function (req, res, patientDB, responder) {
    var username = req.body.username
    if (username.includes(" ")) {
        responder.report_fail_with_message(req, res, "Bad Username");
        return;
    }
    var unencrypt_password = req.body.password
    var dob = req.body.dob
    var weight = req.body.weight
    var height = req.body.height
    var information = req.body.information
    patientDB.add_patient(username, unencrypt_password, dob, weight, height, information, function (worked) {
        if (worked !== false) {
            responder.report_sucess_with_info(req, res, {
                token: worked
            })

        } else {
            responder.report_fail_with_message(req, res, "User already exists");
        }
    });
}