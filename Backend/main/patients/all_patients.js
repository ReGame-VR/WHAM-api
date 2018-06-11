// Gives all patient info in either JSON or HTML form
// Request Response PatientDB AuthorizationDB -> Void
exports.getPatients = function (req, res) {
    req.patientDB.get_all_patient_info(function (info) {
        req.responder.report_sucess(req, res, info, 'patient/patient-overview', {patients: info})
    });
}


// Adds the patient to the database
// Request Response PatientDB -> Void
exports.addPatient = function (req, res) {
    var username = req.body.username
    if (username.includes(" ")) {
        req.responder.report_fail_with_message(req, res, "Bad Username");
        return;
    }
    var unencrypt_password = req.body.password
    var dob = req.body.dob
    var weight = req.body.weight
    var height = req.body.height
    var information = req.body.information
    req.patientDB.add_patient(username, unencrypt_password, dob, weight, height, information, function (worked) {
        if (worked !== false) {
            req.responder.report_sucess_with_info(req, res, {
                token: worked
            })
        } else {
            req.responder.report_fail_with_message(req, res, "User already exists");
        }
    });
}