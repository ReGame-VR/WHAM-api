// Shows the login choosing screen
// Request Response HTTPResponses -> Void
exports.show_login = function(req, res, responder) {
    if (req.headers['accept'].includes("text/html")) {
        responder.render(req, res, 'account/login-picker', {})
    } else {
        responder.report_request_not_supported(req, res);
    }
};
