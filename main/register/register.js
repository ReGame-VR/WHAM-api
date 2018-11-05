// Shows the user registration screen
exports.show_patient_register = function(req, res) {
    req.responder.render(req, res, 'account/register-patient', {});
};

exports.show_therapist_register = function(req, res) {
    req.responder.render(req, res, 'account/register-therapist', {});
};
