exports.canViewPatient = function(req, res, next) {
    req.authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            req.responder.report_bad_token(req, res);
            return;
        }
        req.authorizer.isAllowed(verified, req.params.patientID, '*', function (err, can_view) {
            if (can_view) {
                next();
            } else {
                req.responder.report_not_authorized(req, res);
            }
        });
    });
}

exports.canViewTherapist = function(req, res, next) {
    req.authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            req.responder.report_bad_token(req, res);
            return;
        }
        req.authorizer.isAllowed(verified, req.params.therapistID, '*', function (err, can_view) {
            if (can_view) {
                next();
            } else {
                req.responder.report_not_authorized(req, res);
            }
        });
    });
}

exports.hasAdminPriv = function(req, res, next) {
    req.authorizer.verifyJWT(req, function (verified) {
        if (!verified) {
            req.responder.report_bad_token(req, res);
            return;
        }
        req.authorizer.isAllowed(verified, "/ patients", '*', function (err, can_view) {
            if (can_view) {
                next();
            } else {
                req.responder.report_not_authorized(req, res);
            }
        });
    });
}