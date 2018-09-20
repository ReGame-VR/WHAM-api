// Renders the login page for a patient
// Request Response HTTPResponses -> Void
exports.show_logout = function(req, res) {
    if(req.headers['content-type'] !== undefined && req.headers['content-type'].includes('application/json')) {
        req.responder.report_sucess_no_info();
    } else {
        res.clearCookie("auth_token");
        req.responder.render(req, res, 'account/logout', {});
    }
};