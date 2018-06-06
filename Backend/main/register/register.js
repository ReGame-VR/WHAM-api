// Shows the user registration screen
// Request Response -> Void
exports.show_register = function(req, res, responder) {
    responder.render(req, res, 'account/register', {});
};
