//Gives all therapist info in either JSON or HTML form
// Request Response TherapistDB -> Void
exports.getAllTherapists = function (req, res) {
    req.therapistDB.get_all_therapists().then(therapists => {
        req.responder.report_sucess(req, res, therapists, 'therapist/therapist-overview', {
            therapists: therapists
        });
    }).catch(error => {
        req.responder.report_fail_with_message(req, res, "Bad request");
    });
}

//Adds the therapist to the database
// Request Response TherapistDB -> Void
exports.addTherapist = function (req, res) {
    // Username, password, DOB, Weight, Height, (?) Information
    var username = req.body.username
    var unencrypt_password = req.body.password
    req.therapistDB.add_therapist(username, unencrypt_password).then((token) => {
        if (req.responder.accepts_html(req)) {
            res.cookie('auth_token', token);
            req.responder.redirect(req, res, '../therapists/' + username);
        } else {
            req.responder.report_sucess_with_info(req, res, {
                token: token,
            })
        }
    }).catch(error => {
        req.responder.report_fail_with_message(req, res, "User already exists");
    });
}
