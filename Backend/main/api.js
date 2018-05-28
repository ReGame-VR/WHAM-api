//Shows the API as HTML form
// Request Response -> Void
exports.showAPI = function(req, res) {
    if (req.headers['accept'].includes('text/html')) {
        res.render('api');
    } else if (req.headers['accept'].includes('application/json')) {
        res.writeHead(403, {
            "Content-Type": "application/json"
        });
        res.end();
    } else {
        res.writeHead(403, {
            "Content-Type": "application/json"
        });
        res.end();
    }
}