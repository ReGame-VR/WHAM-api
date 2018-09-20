//Shows the API as HTML form
// Request Response -> Void
exports.showAPI = function(req, res) {
    req.responder.render(req, res, 'api', {});
}