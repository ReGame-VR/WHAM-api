// Shows the login choosing screen
// Request Response HTTPResponses -> Void
exports.show_login = function(req, res) {
    req.responder.render(req, res, 'account/login-picker', {})
};

// Logs this user in
// UserType -> (Request Response -> Void))
exports.user_login = function(user_type) {
    return function(req, res) {
        req.authDB.login(req.body.username, req.body.password, user_type).then(user => {
            if (req.responder.accepts_html(req)) {
                res.cookie('auth_token', user.token);
                req.responder.redirect(req, res, '../' + user_type + 's/' + req.body.username);
            } else {
                req.responder.report_sucess_with_info(req, res, {
                    token: user.token,
                })
            }
        }).catch(error => {
            req.responder.redirect(req, res, '../login/' + user_type);
        });
    }
}

