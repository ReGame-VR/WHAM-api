//Shows the API as HTML form
// Request Response -> Void
exports.showAPI = function(req, res) {
    if (req.headers['accept'].includes('text/html')) {
        req.responder.render(req, res, 'api', {});
    } else {
        req.responder.report_request_not_supported(req, res);
    }
}