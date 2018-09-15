// GETTING
const get_all_patient_requests_sql = 
    `SELECT therapistID 
    FROM PATIENT_THERAPIST 
    WHERE is_accepted = false AND patientID = ?`;

// ADDING
const add_patient_therapist_join_sql = 
    `INSERT INTO PATIENT_THERAPIST VALUES (?, ?, ?, null, false)`;

// DELETING
const delete_indiv_patient_therapist_sql = 
    `DELETE FROM PATIENT_THERAPIST WHERE patientID = ?`;
const delete_therapist_patient_sql = 
    `DELETE FROM PATIENT_THERAPIST WHERE therapistID = ?`;

// UPDATING
const accept_therapist_request_sql = 
`UPDATE PATIENT_THERAPIST SET is_accepted = true 
WHERE patientID = ? AND therapistID = ?`;
const remove_patient_therapist_join_sql = 
`UPDATE PATIENT_THERAPIST SET date_removed = ?
WHERE patientID = ? AND therapistID = ?`;

module.exports = {
    get_all_patient_requests_sql: get_all_patient_requests_sql,
    add_patient_therapist_join_sql: add_patient_therapist_join_sql,
    delete_indiv_patient_therapist_sql: delete_indiv_patient_therapist_sql,
    delete_therapist_patient_sql: delete_therapist_patient_sql,
    accept_therapist_request_sql: accept_therapist_request_sql,
    remove_patient_therapist_join_sql: remove_patient_therapist_join_sql
}


