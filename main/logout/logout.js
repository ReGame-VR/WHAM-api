// Renders the login page for a patient
// Request Response HTTPResponses -> Void
exports.show_logout = function(req, res) {
    if(req.responder.accepts_html(req)) {
        res.clearCookie("auth_token");
        req.responder.redirect(req, res, '/');
    } else {
        req.responder.report_sucess_no_info();
    }
};
