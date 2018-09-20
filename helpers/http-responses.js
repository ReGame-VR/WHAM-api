// A Helper class that every HTTP method should delegate its responses to 
// Created to give a single point of control for things like changing error messages and 
// response codes. 


// Req Res -> Void
// Sends the message to the user that they are
// not authorized to view what they are trying to view
function report_not_authorized(req, res) {
    if (req.headers['content-type'] == undefined) {
        res.writeHead(403);
        res.end();
    } else if (req.headers['content-type'].includes('text/html')) {
        res.render('account/not-allowed');
    } else if (req.headers['content-type'].includes('application/json')) {
        res.writeHead(403);
        res.end();
    }
}

// Req Res -> Void
// Sends the message to the user that their auth token
// is either a fake or expired (or some other reason that it couldn't be verified)
function report_bad_token(req, res) {
    if (req.headers['content-type'] == undefined) {
        res.writeHead(403);
        res.end();
    } else if (req.headers['content-type'].includes('text/html')) {
        res.redirect('/login');
    } else if (req.headers['content-type'].includes('application/json')) {
        res.writeHead(403);
        res.end();
    }
}

// Req Res -> Void
// Sends the message to the user that the content they 
// are trying to view does not exist
function report_not_found(req, res) {
    if (req.headers['content-type'] == undefined) {
        res.writeHead(403);
        res.end();
    } else if (req.headers['content-type'].includes('text/html')) {
        res.render('page-not-found');
    } else if (req.headers['content-type'].includes('application/json')) {
        res.writeHead(403);
        res.end();
    }
}

// Req Res -> Void
// Tells the user that the request is not supported
function report_request_not_supported(req, res) {
    res.writeHead(403, {
        "Content-Type": "application/json"
    });
    res.end();
}

// Req Res -> Void
// Tells the user that their querry suceeded 
// but we have nothing to give back
function report_sucess_no_info(req, res) {
    res.writeHead(204, {
        'Content-Type': 'application/json',
    });
    res.end();
}

// Req Res Object -> Void
// Tells the user that their querry suceeded 
// and we have something to give back
function report_sucess_with_info(req, res, info) {
    res.writeHead(200, {
        'Content-Type': 'application/json',
    });
    res.end(JSON.stringify(info));
}

//Req Res String Object
//Renders this htlm file with the given info
function render(req, res, file_name, object) {
    res.render(file_name, object);
}

// Req Res String
// Redirects the user to this location
function redirect(req, res, location) {
    if (req.headers['content-type'] == undefined) {
        res.writeHead(403);
        res.end();
    } else if (req.headers['content-type'].includes('text/html')) {
        res.redirect(locationZ);
    } else if (req.headers['content-type'].includes('application/json')) {
        res.writeHead(403);
        res.end();
    }
}

// Req Res String -> Void
// Gives error 403 with error: message
function report_fail_with_message(req, res, message) {
    res.writeHead(403, {
        "Content-Type": "application/json"
    });
    res.end(JSON.stringify({
        error: message
    }));
}

// Req Res Object String Object -> Void
// Given the JSON response and the HTML response (for a GET call)
// Will check which one the user is looking for and report the apporpiate information
// If the reqest is not supported, will notify
function report_sucess(req, res, json_info, url, html_info) {
    if(req.headers['content-type'] == undefined) {
        this.report_sucess_with_info(req, res, json_info);
    } else if (req.headers['content-type'].includes('text/html')) {
        this.render(req, res, url, html_info)
    } else if (req.headers['content-type'].includes('application/json')) {
        this.report_sucess_with_info(req, res, json_info);
    } else {
        this.report_request_not_supported(req, res);
    }
}

module.exports = {
    report_not_authorized: report_not_authorized,
    report_bad_token: report_bad_token,
    report_not_found: report_not_found,
    report_request_not_supported: report_request_not_supported,
    report_sucess_no_info: report_sucess_no_info,
    report_sucess_with_info: report_sucess_with_info,
    render: render,
    redirect: redirect,
    report_fail_with_message: report_fail_with_message,
    report_sucess: report_sucess
};