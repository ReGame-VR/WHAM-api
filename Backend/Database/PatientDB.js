require('dotenv').config();
const mysql = require('promise-mysql');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var jwt = require('jsonwebtoken');

/********************SQL STATEMENTS*******************/

//GETTING
const get_all_patient_info_sql = `SELECT username, dob, weight, height, information,
(SELECT score FROM PATIENT_SESSION PS WHERE P.username = PS.patientID ORDER BY time DESC LIMIT 1) as score,
(SELECT time FROM PATIENT_SESSION PS WHERE P.username = PS.patientID ORDER BY time DESC LIMIT 1) as time
FROM PATIENT P`
const get_patient_info_sql = "SELECT username, dob, weight, height, information FROM PATIENT P WHERE P.username = ?";
const get_all_patient_sessions_sql = "SELECT score, time, sessionID FROM PATIENT_SESSION PS WHERE PS.patientID = ? ORDER BY time DESC";
const get_all_patient_message_sql = "SELECT therapistID, message, date_sent, is_read, messageID FROM PATIENT_MESSAGE PM WHERE PM.patientID = ?";
const get_all_patient_requests_sql = "SELECT therapistID FROM PATIENT_THERAPIST WHERE is_accepted = false AND patientID = ?";
const get_specif_patient_session_sql = "SELECT score, sessionID, time FROM PATIENT_SESSION WHERE patientID = ? AND (sessionID = ? or time = ?)";
const get_all_patient_message_replies_sql = "SELECT fromID, date_sent, content, replyID FROM MESSAGE_REPLY WHERE messageID = ?";
const get_specif_message_sql = "SELECT therapistID, message, date_sent, is_read, messageID FROM PATIENT_MESSAGE WHERE patientID = ? AND messageID = ?";

//ADDING
const add_user_sql = "INSERT INTO USER VALUES (?, ?, ?, 1)";
const add_patient_sql = "INSERT INTO PATIENT VALUES (?, ?, ?, ?, ?)";
const add_patient_session_sql = "INSERT INTO PATIENT_SESSION (patientID, score, time) VALUES (?, ?, ?)";
const add_patient_message_sql = "INSERT INTO PATIENT_MESSAGE (patientID, therapistID, message, date_sent, is_read) VALUES (?, ?, ?, ?, false)";
const add_patient_therapist_join_sql = "INSERT INTO PATIENT_THERAPIST VALUES (?, ?, ?, null, false)";
const add_reply_to_message_sql = "INSERT INTO MESSAGE_REPLY (messageID, fromID, date_sent, content) VALUES (?, ?, ?, ?)";

//DELETING
const delete_indiv_patient_session_sql = "DELETE FROM PATIENT_SESSION WHERE patientID = ?";
const delete_indiv_patient_message_sql = "DELETE FROM PATIENT_MESSAGE WHERE patientID = ?";
const delete_indiv_patient_therapist_sql = "DELETE FROM PATIENT_THERAPIST WHERE patientID = ?";
const delete_indiv_patient_sql = "DELETE FROM PATIENT where username = ?";
const delete_indiv_user_sql = "DELETE FROM USER where username = ?";
const delete_specif_session_sql = "DELETE FROM PATIENT_SESSION WHERE patientID = ? AND sessionID = ?";
const delete_specif_message_sql = "DELETE FROM PATIENT_MESSAGE WHERE patientID = ? AND messageID = ?";
const delete_message_replies_for_message = `DELETE MESSAGE_REPLY FROM PATIENT_MESSAGE JOIN MESSAGE_REPLY ON PATIENT_MESSAGE.messageID = MESSAGE_REPLY.messageID
                                            WHERE patientID = ? AND MESSAGE_REPLY.messageID = ?`;

//UPDATING
const mark_message_as_read_sql = "UPDATE PATIENT_MESSAGE SET is_read = true WHERE patientID = ? AND messageID = ?";
const accept_therapist_request_sql = "UPDATE PATIENT_THERAPIST SET is_accepted = true WHERE patientID = ? AND therapistID = ?";
const remove_patient_therapist_join_sql = "UPDATE PATIENT_THERAPIST SET date_removed = ? WHERE patientID = ? AND therapistID = ?";

class PatientDB {

    // Objects:
    // Patient = Object(String Date Number Number String)
    // Patient-Session = Object(String Date Number Number String Number Date)
    // Session = Object(Number Date)
    // Message = Object(String String Date Boolean Number)

    constructor(connection, authorizer) {
        this.pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: "WHAM_TEST"
        });
        this.authorizer = authorizer;
    }

    // Void -> Promise(([List-of Patient-Session])
    // Returns every patients info and their last session
    get_all_patient_info() {
        return this.pool.getConnection().then(connection => {
            var res = connection.query(get_all_patient_info_sql);
            connection.release();
            return res;
        }).then(results => {
            var toReturn = [];
            for (var i = 0; i < results.length; i += 1) {
                toReturn.push({
                    username: results[i].username,
                    dob: results[i].dob,
                    weigth: results[i].weight,
                    height: results[i].height,
                    information: results[i].information,
                    last_score: results[i].score,
                    last_activity_time: results[i].time
                });
            }
            return toReturn
        });

    }

    // String -> Promise([Patient [List-of Session] [List-of Message]])
    // Gives all information for the given patient
    get_patient_info(username) {
        var inserts = [username];
        var info_query = mysql.format(get_patient_info_sql, inserts);
        var session_query = mysql.format(get_all_patient_sessions_sql, inserts);
        var message_query = mysql.format(get_all_patient_message_sql, inserts);
        var requests_query = mysql.format(get_all_patient_requests_sql, inserts);

        var user_info;
        var session_info;
        var message_info;

        return this.pool.getConnection().then(connection => {
            let res = Promise.all([
                connection.query(info_query),
                connection.query(session_query),
                connection.query(message_query),
                connection.query(requests_query)
            ]);
            connection.release();
            return res;
        }).then(([user_results, session_results, message_results, requests_results]) => {
            user_info = {
                username: user_results[0].username,
                dob: user_results[0].dob,
                weight: user_results[0].weight,
                height: user_results[0].height,
                information: user_results[0].information
            };

            session_info = [];
            for (var i = 0; i < session_results.length; i += 1) {
                session_info.push({
                    score: session_results[i].score,
                    time: session_results[i].time,
                    sessionID: session_results[i].sessionID
                });
            }

            message_info = []
            for (var i = 0; i < message_results.length; i += 1) {
                message_info.push({
                    therapistID: message_results[i].therapistID,
                    message_content: message_results[i].message,
                    date_sent: message_results[i].date_sent,
                    is_read: message_results[i].is_read
                });
            }

            var requests = [];
            for (var i = 0; i < requests_results.length; i += 1) {
                requests.push(requests_results[i].therapistID);
            }
            return [user_info, session_info, message_info, requests];
        });
    }

    // String String String Number Number String -> Promise(String)
    // Tries to add the patient to the database
    // If suceed, returns 
    // If fail, throws an error (user already exists or other)
    // Note: Weight in Kilo, Height in CM, DOB in YYYY-MM-DD
    add_patient(username, unencrypt_password, dob, weight, height, information) {
        // Username, DOB, Weight, Height
        var salt = bcrypt.genSaltSync(saltRounds);
        var password = bcrypt.hashSync(unencrypt_password, salt);


        var user_inserts = [username, password, salt];
        var patient_inserts = [username, dob, weight, height, information];
        var add_user_query = mysql.format(add_user_sql, user_inserts);
        var add_patient_query = mysql.format(add_patient_sql, patient_inserts);
        return this.pool.getConnection().then(connection => {
            var res = Promise.all([connection.query(add_user_query), connection.query(add_patient_query)]);
            connection.release();
            return res;
        }).then(result => {
            var token = jwt.sign({
                data: {
                    username: username,
                    password_hash: password
                }
            }, process.env.JWT_SECRET, {
                expiresIn: '10d'
            });
            return token
        });
    }

    // String -> Promise(Void)
    // Tries to purge the patient from the DB
    // Including all session, message, and patient-therapist info
    // If suceed, gives true
    // If fail, gives false (unknown reason, probably server error)
    delete_patient(patientID) {
        var inserts = [patientID];
        return this.pool.getConnection().then(connection => {
            var delete_indiv_patient_session_query = mysql.format(delete_indiv_patient_session_sql, inserts);
            var delete_indiv_patient_message_query = mysql.format(delete_indiv_patient_message_sql, inserts);
            var delete_indiv_patient_therapist_query = mysql.format(delete_indiv_patient_therapist_sql, inserts);
            var delete_indiv_patient_query = mysql.format(delete_indiv_patient_sql, inserts);
            var delete_indiv_user_query = mysql.format(delete_indiv_user_sql, inserts);
            connection.release();
            var res = Promise.all(
                [connection.query(delete_indiv_patient_session_query), 
                connection.query(delete_indiv_patient_message_query),
                connection.query(delete_indiv_patient_therapist_query),
                connection.query(delete_indiv_patient_query),
                connection.query(delete_indiv_user_query)]);
            return res;
        }).then(([a,b, c, d, e]) => {
            if (e.affectedRows !== 0) {
                return
            } else {
                throw new Error("No User Deleted");
            }
        })
    }

    // String -> Promise([List-of Session])
    // Gives all the session info for a given patient
    get_patient_sessions(patientID) {
        var inserts = [patientID];

        return this.pool.getConnection().then(connection => {
            var session_query = mysql.format(get_all_patient_sessions_sql, inserts);
            var res = connection.query(session_query);
            connection.release();
            return res;
        }).then(session_results => {
            var session_info = [];
            for (var i = 0; i < session_results.length; i += 1) {
                session_info.push({
                    score: session_results[i].score,
                    time: session_results[i].time,
                    sessionID: session_results[i].sessionID
                });
            }
            return session_info;
        })
    }

    // String Number String -> Promise(Void)
    // Adds an entry for a session to the DB
    // If suceed, gives true
    // If fail, gives false (server error or already added)
    add_patient_session(patientID, score, time) {
        var inserts = [patientID, score, time];

        return this.pool.getConnection().then(connection => {
            var add_patient_session_query = mysql.format(add_patient_session_sql, inserts);
            var res = connection.query(add_patient_session_query);
            connection.release();
            return res;
        });

    }

    // String String -> Promise(Void)
    // Deletes a given patient session for the DB
    // If suceed, gives true
    // If fail, gives false (server error)
    delete_patient_session(patientID, sessionID) {
        var inserts = [patientID, sessionID];

        return this.pool.getConnection().then(connection => {
            var delete_specif_session_query = mysql.format(delete_specif_session_sql, inserts);
            var res = connection.query(delete_specif_session_query);
            connection.release();
            return res;
        }).then(result => {
            if (result.affectedRows === 0) {
                throw new Error("Patient not found");
            } else {
                return;
            }
        })
    }


    // String String -> Promise(Session)
    // Gives the score for the session at the given time/sessionID (accepts both)
    get_patient_session_specific(patientID, sessionID) {
        var inserts = [patientID, sessionID, sessionID];

        return this.pool.getConnection().then(connection => {
            var get_specif_patient_session_query = mysql.format(get_specif_patient_session_sql, inserts);
            var res = connection.query(get_specif_patient_session_query);
            connection.release();
            return res;
        }).then(result => {
            if (result.length == 0) {
                throw new Error("Patient not found");
            } else {
                return {
                    activityLevel: result[0].score,
                    time: result[0].time,
                    id: result[0].sessionID
                }
            }
        });

    }

    // String String (Maybe-Error Maybe-User -> Void) -> Void
    // Returns true given a proper login
    // False given an incorrect login
    login(username, unencrypt_password) {
        return this.authorizer.login(username, unencrypt_password);
    }

    // String String String String -> Promise(Number)
    // Adds a message to this patients database entry
    send_patient_a_message(patientID, therapistID, message, time) {
        var inserts = [patientID, therapistID, message, time];
        return this.pool.getConnection().then(connection => {
            var query = mysql.format(add_patient_message_sql, inserts);
            var res = connection.query(query);
            connection.release();
            return res;
        }).then(result => {
            return result.insertId;
        })
    }

    // String -> Promise([List-of Message])
    // Gives every message that this patient has ever recieved
    get_all_messages_for(patientID) {
        var inserts = [patientID];
        return this.pool.getConnection().then(connection => {
            var query = mysql.format(get_all_patient_message_sql, inserts);
            var res = connection.query(query);
            connection.release();
            return res;
        }).then(message_result => {
            var toReturn = [];
            for (var i = 0; i < message_result.length; i++) {
                toReturn.push({
                    therapistID: message_result[i].therapistID,
                    patientID: patientID,
                    message_content: message_result[i].message,
                    date_sent: message_result[i].date_sent,
                    is_read: message_result[i].is_read,
                    messageID: message_result[i].messageID,
                });
            }
            return toReturn;
        })
    }

    // String Int -> Promise(Void)
    // Marks the given message id as read
    // Gives back whether the querry suceeded or not
    mark_message_as_read(patientID, messageID) {
        var inserts = [patientID, messageID];
        return this.pool.getConnection().then(connection => {
            var query = mysql.format(mark_message_as_read_sql, inserts);
            var res = connection.query(query);
            connection.release();
            return res;
        }).then(result => {
            if (result.affectedRows === 0) {
                throw new Error("Message not found");
            } else {
                return;
            }
        })
    }

    // String String -> Promise(Message)
    // Returns the info for a specific message
    get_specific_message(patientID, messageID) {
        var message_inserts = [patientID, messageID];

        var reply_inserts = [messageID];

        return this.pool.getConnection().then(connection => {
            var message_sql = mysql.format(get_specif_message_sql, message_inserts);
            var reply_sql = mysql.format(get_all_patient_message_replies_sql, reply_inserts);
            var res = Promise.all([connection.query(message_sql), connection.query(reply_sql)])
            connection.release();
            return res
        }).then(([message_result, reply_result]) => {
            if (message_result.length === 0) {
                throw new Error("Message Not Found");
            }
            var replies = [];
            for (var i = 0; i < reply_result.length; i += 1) {
                replies.push({
                    sentID: reply_result[i].fromID,
                    messageID: messageID,
                    date_sent: reply_result[i].date_sent,
                    reply_content: reply_result[i].content
                })
            }
            return {
                therapistID: message_result[0].therapistID,
                patientID: patientID,
                message_content: message_result[0].message,
                date_sent: message_result[0].date_sent,
                is_read: message_result[0].is_read,
                messageID: message_result[0].messageID,
                replies: replies
            };
        });
    }

    // String String Date -> Promise(Void)
    // Pairs this therapist and patinet in the PATIENT_THERAPIST DB
    assign_to_therapist(patientID, therapistID, date_added) {
        var inserts = [patientID, therapistID, date_added];
        return this.pool.getConnection().then(connection => {
            var query = mysql.format(add_patient_therapist_join_sql, inserts);
            var res = connection.query(query);
            connection.release();
            return res;
        });
    }

    // String String -> Promise(Void)
    // Marks this patient-therapist join as accepted
    accept_therapist_request(patientID, therapistID) {
        var inserts = [patientID, therapistID];
        return this.pool.getConnection().then(connection => {
            var query = mysql.format(accept_therapist_request_sql, inserts);
            var res = connection.query(query);
            connection.release();
            return res;
        }).then(result => {
            if (result.affectedRows === 0) {
                throw new Error("Pair does not exist");
            }
        });
    }

    // String String Date -> Promise(Void)
    // Unpairs this therapist and patinet in the PATIENT_THERAPIST DB
    // DOES NOT delete this pair, simply marks its date_removed as the given date
    unassign_to_therapist(patientID, therapistID, date_removed) {
        var inserts = [date_removed, patientID, therapistID];
        return this.pool.getConnection().then(connection => {
            var query = mysql.format(remove_patient_therapist_join_sql, inserts);
            connection.release();
            var res = connection.query(query);
            return res;
        }).then(result => {
            if (result.affectedRows === 0) {
                throw new Error("Pair not found");
            }
        });
    }

    // String -> Promise(Void)
    // Deletes this message
    delete_message(patientID, messageID) {
        return this.pool.getConnection().then(connection => {
            var reply_query = mysql.format(delete_message_replies_for_message, [patientID, messageID])
            var message_query = mysql.format(delete_specif_message_sql, [patientID, messageID])
            var res = Promise.all([connection.query(reply_query), connection.query(message_query)]);
            connection.release();
            return res;
        }).then(([replies, message]) => {
            if (message.affectedRows === 0) {
                throw new Error("Message not found");
            }
        });
    }

    // String String String Date -> Promise(Void)
    // Sends this reply to this message from this ID
    reply_to_message(sentID, messageID, reply_content, date_sent) {
        return this.pool.getConnection().then(connection => {
            var query = mysql.format(add_reply_to_message_sql, [messageID, sentID, date_sent, reply_content]);
            var res = connection.query(query);
            connection.release();
            return res;
        });
    }

}

module.exports = PatientDB;