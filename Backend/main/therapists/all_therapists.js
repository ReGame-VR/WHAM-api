//Gives all therapist info in either JSON or HTML form
// Request Response TherapistDB -> Void
exports.getAllTherapists = function (req, res, therapistDB, authorizer, responder) {
    authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            responder.report_bad_token(req, res);
            return;
        }
        authorizer.isAllowed(verified, "/therapist", '*', function (err, can_view) {
            if (can_view) {
                therapistDB.get_all_therapists(function (therapists) {
                    if (req.headers['accept'].includes('text/html')) {
                        responder.render(req, res, 'therapist/therapist-overview', {
                            therapists: therapists
                        });
                    } else if (req.headers['accept'].includes('application/json')) {
                        if (therapists == false) {
                            responder.report_not_found(req, res);
                        } else {
                            responder.report_sucess_with_info(req, res, therapists);
                        }
                    }
                });
            } else {
                responder.report_not_authorized(req, res);
            }
        });
    });
}

//Adds the therapist to the database
// Request Response TherapistDB -> Void
exports.addTherapist = function (req, res, therapistDB, responder) {
    // Username, password, DOB, Weight, Height, (?) Information
    var username = req.body.username
    var unencrypt_password = req.body.password
    therapistDB.add_therapist(username, unencrypt_password, function (worked) {
        if (worked !== false) {
            responder.report_sucess_with_info(req, res, {
                token: worked
            })
        } else {
            responder.report_fail_with_message(req, res, "User already exists");
        }
    });
}