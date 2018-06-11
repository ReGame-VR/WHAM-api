// Says whether the given user can view the given patientID
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

// Says whether the given user can view the given therapistID
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

// Says whether the given user has admin prividlege
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