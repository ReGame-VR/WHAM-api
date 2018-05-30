// Renders the login page for a patient
// Request Response -> Void
exports.show_login = function(req, res) {
    if(req.headers['accept'].includes('application/json')) {
        res.writeHead(403, {
            "Content-Type": "application/json"
        });
        res.end();
    } else {
        res.render('login-therapist');
    }
};
