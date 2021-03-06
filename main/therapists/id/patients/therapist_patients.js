//Returns the info for all patients of this therapist
// Request Response TherapistDB -> Void
exports.getTherapistPatients = function (req, res) {
    var therapistID = req.params.therapistID;
    req.therapistDB.get_all_patients(therapistID).then(info => {
        req.responder.report_sucess(req, res, info, 'patient/patient-overview', {
            patients: info,
            therapistID: therapistID
        })
    }).catch(error => {
        req.responder.report_not_found(req, res);
    })
}

// Adds the given patient to this patient-therapist pair
// Request Response PatientDB -> Void
exports.addPatientTherapist = function (req, res) {
    var therapistID = req.params.therapistID;
    var patientID = req.body.patientID;
    req.requestDB.assign_to_therapist(patientID, therapistID, new Date()).then(() => {
        req.responder.report_sucess_no_info(req, res);
    }).catch(error => {
        req.responder.report_not_found(req, res);
    });
}