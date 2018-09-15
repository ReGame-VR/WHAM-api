//GETTING
const get_all_patient_sessions_sql = 
    `SELECT score, time, effort, motivation, engagement, SESSION.sessionID 
    FROM (SESSION JOIN SESSION_ITEM on SESSION.sessionID = SESSION_ITEM.sessionID) 
    WHERE patientID = ? ORDER BY sessionID, time DESC`;
const get_specif_patient_session_sql = 
    `SELECT score, time, effort, motivation, engagement 
    FROM (SESSION JOIN SESSION_ITEM on SESSION.sessionID = SESSION_ITEM.sessionID) 
    WHERE patientID = ? AND SESSION.sessionID = ?`;
const get_patient_recent_sessions_sql = 
    `SELECT score, time, effort, motivation, engagement 
    FROM PATIENT P JOIN SESSION PS JOIN SESSION_ITEM SI on PS.sessionID = SI.sessionID ON P.username = PS.patientID 
    WHERE P.username = ? 
    ORDER BY SI.time DESC`;

//ADDING
const add_patient_session_sql = 
    `INSERT INTO SESSION (patientID, effort, motivation, engagement) VALUES (?, ?, ?, ?)`;
const add_patient_session_item_sql = 
    `INSERT INTO SESSION_ITEM VALUES (?, ?, ?)`

//DELETING
const delete_indiv_session_sql = 
    `DELETE FROM SESSION WHERE patientID = ? AND sessionID = ?`;

module.exports = {
    get_all_patient_sessions_sql: get_all_patient_sessions_sql,
    get_specif_patient_session_sql: get_specif_patient_session_sql,
    get_patient_recent_sessions_sql: get_patient_recent_sessions_sql,
    add_patient_session_item_sql: add_patient_session_item_sql,
    delete_indiv_session_sql: delete_indiv_session_sql,
    add_patient_session_sql: add_patient_session_sql
}