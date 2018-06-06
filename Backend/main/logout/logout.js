// Renders the login page for a patient
// Request Response HTTPResponses -> Void
exports.show_logout = function(req, res, responder) {
    if(req.headers['accept'].includes('application/json')) {
        responder.report_sucess_no_info();
    } else {
        res.clearCookie("auth_token");
        responder.render(req, res, 'account/logout', {});
    }
};