//Shows the API as HTML form
// Request Response -> Void
exports.showAPI = function(req, res, responder) {
    if (req.headers['accept'].includes('text/html')) {
        responder.render(req, res, 'api', {});
    } else {
        responder.report_request_not_supported(req, res);
    }
}