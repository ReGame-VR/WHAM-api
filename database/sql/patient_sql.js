// GETTING
const get_all_patient_info_sql =
    `SELECT username, dob, weight, height, information,
    (SELECT score FROM (SESSION JOIN SESSION_ITEM on SESSION.sessionID = SESSION_ITEM.sessionID) 
        WHERE P.username = patientID ORDER BY time DESC LIMIT 1) as last_score,
    (SELECT time FROM (SESSION JOIN SESSION_ITEM on SESSION.sessionID = SESSION_ITEM.sessionID) 
        WHERE P.username = patientID ORDER BY time DESC LIMIT 1) as last_activity_time,
    (SELECT effort FROM (SESSION JOIN SESSION_ITEM on SESSION.sessionID = SESSION_ITEM.sessionID) 
        WHERE P.username = patientID ORDER BY time DESC LIMIT 1) as last_effort,
    (SELECT motivation FROM (SESSION JOIN SESSION_ITEM on SESSION.sessionID = SESSION_ITEM.sessionID) 
        WHERE P.username = patientID ORDER BY time DESC LIMIT 1) as last_motivation,
    (SELECT engagement FROM (SESSION JOIN SESSION_ITEM on SESSION.sessionID = SESSION_ITEM.sessionID) 
        WHERE P.username = patientID ORDER BY time DESC LIMIT 1) as last_engagement
    FROM PATIENT P`
const get_patient_info_sql =
    `SELECT username, dob, weight, height, information 
    FROM PATIENT P 
    WHERE P.username = ?`;

// ADDING
const add_patient_sql = 
    `INSERT INTO PATIENT VALUES (?, ?, ?, ?, ?)`;

// DELETING
const delete_indiv_patient_sql = 
    `DELETE FROM PATIENT where username = ?`;

module.exports = {
    get_all_patient_info_sql: get_all_patient_info_sql,
    get_patient_info_sql: get_patient_info_sql,
    add_patient_sql: add_patient_sql,
    delete_indiv_patient_sql: delete_indiv_patient_sql
}