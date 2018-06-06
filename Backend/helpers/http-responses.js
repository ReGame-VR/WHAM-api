class HTTPResponses {

    constructor() {
    }


    // Req Res -> Void
    // Sends the message to the user that they are
    // not authorized to view what they are trying to view
    report_not_authorized(req, res) {
        if(req.headers['accept'] === undefined) {
            res.writeHead(403);
            res.end();
        } else if (req.headers['accept'].includes('text/html')) {
            res.render('account/not-allowed');
        } else if (req.headers['accept'].includes('application/json')) {
            res.writeHead(403);
            res.end();
        }
    }

    // Req Res -> Void
    // Sends the message to the user that their auth token
    // is either a fake or expired (or some other reason that it couldn't be verified)
    report_bad_token(req, res) {
        if(req.headers['accept'] === undefined) {
            res.writeHead(403);
            res.end();
        } else if (req.headers['accept'].includes('text/html')) {
            res.redirect(req.baseUrl + '/login');
        } else if (req.headers['accept'].includes('application/json')) {
            res.writeHead(403);
            res.end();
        }
    }

    // Req Res -> Void
    // Sends the message to the user that the content they 
    // are trying to view does not exist
    report_not_found(req, res) {
        if(req.headers['accept'] === undefined) {
            res.writeHead(403);
            res.end();
        } else if (req.headers['accept'].includes('text/html')) {
            res.render('page-not-found');
        } else if (req.headers['accept'].includes('application/json')) {
            res.writeHead(403);
            res.end();
        }
    }

    report_request_not_supported(req, res) {
        res.writeHead(403, {
            "Content-Type": "application/json"
        });
        res.end();
    }

    report_sucess_no_info(req, res) {
        res.writeHead(204, {
            'Content-Type': 'application/json',
        });
        res.end();
    }

    report_sucess_with_info(req, res, info) {
        res.writeHead(200, {
            'Content-Type': 'application/json',
        });
        res.end(JSON.stringify(info));
    }

    render(req, res, file_name, object) {
        res.render(file_name, object);
    }

    redirect(req, res, location) {
        res.redirect(location);
    }

    // Req Res String -> Void
    // Gives error 403 with error: message
    report_fail_with_message(req, res, message) {
        res.writeHead(403, {
            "Content-Type": "application/json"
        });
        res.end(JSON.stringify({
            error: message
        }));
    }

}

module.exports = HTTPResponses;