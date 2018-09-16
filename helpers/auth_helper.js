// Says whether the given user can view the given patientID
exports.canViewPatient = function (req, res, next) {
    req.authDB.canViewPatient(req.verified, req.params.patientID).then(can_view => {
        if (can_view) {
            next();
        } else {
            throw new Error("Cannot access patient");
        }
    }).catch(error => {
        req.responder.report_not_authorized(req, res);
    })
}

// Says whether the given user can view the given therapistID
exports.canViewTherapist = function (req, res, next) {
    req.authDB.canViewTherapist(req.verified, req.params.therapistID).then(can_view => {
        if (can_view) {
            next();
        } else {
            throw new Error("Cannot access therapist");
        }
    }).catch(error => {
        req.responder.report_not_authorized(req, res);
    })
}

// Says whether the given user can view the given messageID
exports.canViewMessage = function (req, res, next) {
    req.authDB.canViewMessage(req.verified, req.params.messageID).then(can_view => {
        if (can_view) {
            next();
        } else {
            throw new Error("Cannot access message");
        }
    }).catch(error => {
        req.responder.report_not_authorized(req, res);
    })
}

// Says whether the given user has admin prividlege
exports.hasAdminPriv = function (req, res, next) {
    req.authDB.hasAdminPriv(req.verified).then(can_view => {
        if (can_view) {
            next();
        } else {
            throw new Error("Not an admin");
        }
    }).catch(error => {
        req.responder.report_not_authorized(req, res);
    })
}

// Vefifies the JWT and writes the info to the req
exports.verifyJWT = function (req, res, next) {
    req.authDB.verifyJWT(req).then(verified => {
        req.verified = verified;
        next();
    }).catch(error => {
        req.responder.report_bad_token(req, res);
    });
}