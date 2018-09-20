// Renders the login page for a patient
// Request Response HTTPResponses -> Void
exports.show_login = function (req, res) {
    req.responder.render(req, res, 'account/login-therapist', {});
};