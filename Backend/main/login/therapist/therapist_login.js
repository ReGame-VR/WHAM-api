// Renders the login page for a patient
// Request Response HTTPResponses -> Void
exports.show_login = function (req, res) {
    if (req.headers['accept'].includes('text/html')) {
        req.responder.render(req, res, 'account/login-therapist', {});
    } else {
        req.responder.report_request_not_supported(req, res);
    }
};

// The function that is called after Passport verifies the user login
// Request Response HTTPResponses -> Void
exports.therapist_login = function (req, res) {
    if (req.headers['accept'].includes("text/html")) {
        res.cookie('auth_token', req.user.token);
        req.responder.redirect(req, res, '../therapists/' + req.body.username);
    } else {
        req.responder.report_sucess_with_info(req, res, {
            token: req.user.token,
        })
    }
}