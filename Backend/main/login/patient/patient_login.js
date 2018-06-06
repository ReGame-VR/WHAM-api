// Renders the login page for a patient
// Request Response HTTPResponses -> Void
exports.show_login = function(req, res, responder) {
    if (req.headers['accept'].includes('text/html')) {
        responder.render(req, res, 'account/login-patient', {});
    } else {
        responder.report_request_not_supported(req, res);
    }
};

// The function that is called after Passport verifies the user login
// Request Response HTTPResponses -> Void
exports.patient_login = function (req, res, responder) {
    if (req.headers['accept'].includes("text/html")) {
        res.cookie('auth_token', req.user.token);
        responder.redirect(req, res, '../patients/' + req.body.username);
    } else {
        responder.report_sucess_with_info(req, res, {
            token: req.user.token,
        })
    }
}