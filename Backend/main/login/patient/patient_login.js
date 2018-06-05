// Renders the login page for a patient
// Request Response -> Void
exports.show_login = function(req, res) {
    if(req.headers['accept'].includes('application/json')) {
        res.writeHead(403, {
            "Content-Type": "application/json"
        });
        res.end();
    } else {
        res.render('login-patient');
    }
};


exports.patient_login = function (req, res) {
    if(req.headers['accept'].includes("text/html")) {
        res.cookie('auth_token', req.user.token);
        res.redirect('../patients/' + req.body.username);
    } else {
        res.writeHead(200, {
            'Content-Type': 'application/json',
        });
        res.end(JSON.stringify({
            token: req.user.token,
        }));
    }
}