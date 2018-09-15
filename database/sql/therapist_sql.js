//GETTING
const get_all_therapist_info =
    `SELECT T.username, IFNULL(C.c, 0) as c
    FROM THERAPIST T LEFT JOIN
    (SELECT username, COUNT(*) as c FROM THERAPIST T, PATIENT_THERAPIST PT
    WHERE T.username = PT.therapistID AND PT.date_removed IS NULL AND PT.is_accepted = true GROUP BY T.username) C
    ON T.username = C.username`;
const get_specif_therapist_info =
    get_all_therapist_info + ` WHERE T.username = ?`;
const get_therapist_patients_sql =
    `SELECT username, dob, weight, height, information
    FROM PATIENT P, PATIENT_THERAPIST PT
    WHERE P.username = PT.patientID AND PT.therapistID = ? AND PT.date_removed IS NULL AND is_accepted = true`

// ADDING
const add_therapist_sql = 
    `INSERT INTO THERAPIST VALUES (?)` 

// DELETING
const delete_therapist_sql = 
    `DELETE FROM THERAPIST WHERE username = ?`;

module.exports = {
    get_all_therapist_info: get_all_therapist_info,
    get_specif_therapist_info: get_specif_therapist_info,
    get_therapist_patients_sql: get_therapist_patients_sql,
    delete_therapist_sql: delete_therapist_sql,
    add_therapist_sql: add_therapist_sql
}
