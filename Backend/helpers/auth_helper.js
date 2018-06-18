// Says whether the given user can view the given patientID
exports.canViewPatient = function (req, res, next) {
    req.authorizer.isAllowed(req.verified, req.params.patientID, '*', function (err, can_view) {
        if (can_view) {
            next();
        } else {
            req.responder.report_not_authorized(req, res);
        }
    });
}

// Says whether the given user can view the given therapistID
exports.canViewTherapist = function (req, res, next) {
    req.authorizer.isAllowed(req.verified, req.params.therapistID, '*', function (err, can_view) {
        if (can_view) {
            next();
        } else {
            req.responder.report_not_authorized(req, res);
        }
    });
}

// Says whether the given user can view the given messageID
exports.canViewMessage = function (req, res, next) {
    req.authorizer.isAllowed(req.verified, " message " + req.params.messageID, '*', function (err, can_view) {
        if (can_view) {
            next();
        } else {
            req.responder.report_not_authorized(req, res);
        }
    });
}

// Says whether the given user has admin prividlege
exports.hasAdminPriv = function (req, res, next) {
    req.authorizer.isAllowed(req.verified, "/ patients", '*', function (err, can_view) {
        if (can_view) {
            next();
        } else {
            req.responder.report_not_authorized(req, res);
        }
    });
}

// Vefifies the JWT and writes the info to the req
exports.verifyJWT = function (req, res, next) {
    req.authorizer.verifyJWT(req).then(verified => {
        req.verified = verified;
        next();
    }).catch(error => {
        req.responder.report_bad_token(req, res);
    });
}