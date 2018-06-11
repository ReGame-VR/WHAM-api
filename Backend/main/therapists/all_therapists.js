//Gives all therapist info in either JSON or HTML form
// Request Response TherapistDB -> Void
exports.getAllTherapists = function (req, res) {
    req.therapistDB.get_all_therapists(function (therapists) {
        if (therapists == false) {
            req.responder.report_not_found(req, res);
        } else {
            req.responder.report_sucess(req, res, therapists, 'therapist/therapist-overview', {
                therapists: therapists
            });
        }
    });
}

//Adds the therapist to the database
// Request Response TherapistDB -> Void
exports.addTherapist = function (req, res) {
    // Username, password, DOB, Weight, Height, (?) Information
    var username = req.body.username
    var unencrypt_password = req.body.password
    req.therapistDB.add_therapist(username, unencrypt_password, function (worked) {
        if (worked !== false) {
            req.responder.report_sucess_with_info(req, res, {
                token: worked
            })
        } else {
            req.responder.report_fail_with_message(req, res, "User already exists");
        }
    });
}