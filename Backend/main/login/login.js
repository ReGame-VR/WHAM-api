// Shows the login choosing screen
// Request Response -> Void
exports.show_login = function(req, res) {
    if (req.accepts('html')) {
        res.render('login-picker');
    } else {
        res.writeHead(403, {
            'Content-Type': 'application/json',
        });
        res.end(JSON.stringify({
            error: 'Invalid password'
        }));
    }
};
