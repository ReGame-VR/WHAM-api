// GETTING
const get_specif_message_sql =
    `SELECT therapistID, message, date_sent, is_read, messageID 
        FROM PATIENT_MESSAGE 
        WHERE patientID = ? AND messageID = ?`;
const get_all_patient_message_replies_sql =
    `SELECT fromID, date_sent, content, replyID 
        FROM MESSAGE_REPLY WHERE messageID = ?`;
const get_all_patient_message_sql = 
    `SELECT therapistID, message as message_content, is_read, date_sent, patientID, messageID 
    FROM PATIENT_MESSAGE PM 
    WHERE PM.patientID = ?`;
const get_message_from_sql = 
    `SELECT patientID, message, date_sent, is_read, messageID
    FROM PATIENT_MESSAGE 
    WHERE therapistID = ?`;

//ADDING
const add_patient_message_sql =
    `INSERT INTO PATIENT_MESSAGE (patientID, therapistID, message, date_sent, is_read) VALUES (?, ?, ?, ?, false)`;
const add_reply_to_message_sql =
    `INSERT INTO MESSAGE_REPLY (messageID, fromID, date_sent, content) VALUES (?, ?, ?, ?)`;

// DELETING
const delete_indiv_patient_message_sql = 
    `DELETE FROM PATIENT_MESSAGE WHERE patientID = ?`;
const delete_specif_session_sql =
    `DELETE FROM SESSION WHERE patientID = ? AND SESSION.sessionID = ?`;
const delete_specif_message_sql =
    `DELETE FROM PATIENT_MESSAGE WHERE patientID = ? AND messageID = ?`;
const delete_therapist_message_sql = 
    `DELETE FROM PATIENT_MESSAGE WHERE therapistID = ?`;

// UPDATING
const mark_message_as_read_sql =
    `UPDATE PATIENT_MESSAGE SET is_read = true WHERE patientID = ? AND messageID = ?`;

module.exports = {
    get_specif_message_sql: get_specif_message_sql,
    get_all_patient_message_replies_sql: get_all_patient_message_replies_sql,
    add_patient_message_sql: add_patient_message_sql,
    add_reply_to_message_sql: add_reply_to_message_sql,
    get_all_patient_message_sql: get_all_patient_message_sql,
    get_message_from_sql: get_message_from_sql,
    delete_indiv_patient_message_sql: delete_indiv_patient_message_sql,
    delete_specif_session_sql: delete_specif_session_sql,
    delete_specif_message_sql: delete_specif_message_sql,
    delete_therapist_message_sql: delete_therapist_message_sql,
    mark_message_as_read_sql: mark_message_as_read_sql
}