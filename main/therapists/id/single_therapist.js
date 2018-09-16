//Returns the info for a single therapist
// Request Response TherapistDB -> Void
exports.getTherapist = function (req, res) {
    var therapistID = req.params.therapistID;
    req.therapistDB.get_all_patients(therapistID).then(info => {
            req.responder.report_sucess(req, res, info, 'therapist/therapist-detail', {
                patients: info,
                therapistID: therapistID
            })
    }).catch(error => {
        req.responder.report_not_found(req, res);
    })
}

//Deletes this therapist from the database
// Request Response TherapistDB -> Void
exports.deleteTherapist = function (req, res) {
    var therapistID = req.params.therapistID;
    req.therapistDB.delete_therapist(therapistID).then(() => {
        req.responder.report_sucess_no_info(req, res);
    }).catch(error => {
        req.responder.report_not_found(req, res);
    });
}