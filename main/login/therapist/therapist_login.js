// Renders the login page for a patient
// Request Response HTTPResponses -> Void
exports.show_login = function (req, res) {
    if (req.headers['accept'].includes('text/html')) {
        req.responder.render(req, res, 'account/login-therapist', {});
    } else {
        req.responder.report_request_not_supported(req, res);
    }
};