// Renders the login page for a patient
// Request Response -> Void
exports.show_logout = function(req, res) {
    if(req.headers['accept'].includes('application/json')) {
        res.writeHead(200, {
            "Content-Type": "application/json"
        });
        res.end();
    } else {
        res.clearCookie("auth_token");
        res.render('account/logout');
    }
};