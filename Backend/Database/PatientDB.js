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
const delete_indiv_patient_therapist_sql  = "DELETE FROM PATIENT_THERAPIST WHERE patientID = ?";
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

    // ([List-of Patient-Session] -> Void) -> Void
    // Calls the callback with every patients info and their last session
    get_all_patient_info(callback) {
        this.pool.getConnection().then(function (connection) {
            connection.query(get_all_patient_info_sql).then(function (results) {
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
                connection.release();
                callback(toReturn);
            }).catch(function (error) {
                connection.release();
                callback([]);
            });
        }).catch(function (error) {
            throw (error);
        });
    }

    // String ([Maybe  //False if user does not exist
    //  Patient  // User Info
    //  [List-of Session]  //Session Info
    //  [List-of Message]]  //Message Info
    //  -> Void)
    //  -> Void
    // Gives all information for the given patient
    get_patient_info(username, callback) {
        var inserts = [username];
        var info_query = mysql.format(get_patient_info_sql, inserts);
        var session_query = mysql.format(get_all_patient_sessions_sql, inserts);
        var message_query = mysql.format(get_all_patient_message_sql, inserts);
        var requests_query = mysql.format(get_all_patient_requests_sql, inserts);

        this.pool.getConnection().then(function (connection) {
            connection.query(info_query).then(function (info_results) {
                var user_info = {
                    username: info_results[0].username,
                    dob: info_results[0].dob,
                    weight: info_results[0].weight,
                    height: info_results[0].height,
                    information: info_results[0].information
                };
                connection.query(session_query).then(function (session_results) {
                    var session_info = [];
                    for (var i = 0; i < session_results.length; i += 1) {
                        session_info.push({
                            score: session_results[i].score,
                            time: session_results[i].time,
                            sessionID: session_results[i].sessionID
                        });
                    }
                    connection.query(message_query).then(function (message_results) {
                        var message_info = []
                        for (var i = 0; i < message_results.length; i += 1) {
                            message_info.push({
                                therapistID: message_results[i].therapistID,
                                message_content: message_results[i].message,
                                date_sent: message_results[i].date_sent,
                                is_read: message_results[i].is_read
                            });
                        }
                        connection.query(requests_query).then(function (requests_results) {
                            var requests = [];
                            for (var i = 0; i < requests_results.length; i += 1) {
                                requests.push(requests_results[i].therapistID);
                            }
                            connection.release();
                            callback(user_info, session_info, message_info, requests);
                        }).catch(function (error) {
                            connection.release();
                            callback(false, false, false, false);
                        });
                    }).catch(function (error) {
                        connection.release();
                        callback(false, false, false, false);
                    });
                }).catch(function (error) {
                    connection.release();
                    callback(false, false, false, false);
                });
            }).catch(function (error) {
                connection.release();
                callback(false, false, false, false);
            });
        }).catch(function (error) {
            callback(false, false, false, false);
        });
    }

    // String String String Number Number String (Boolean -> Void) -> Void
    // Tries to add the patient to the database
    // If suceed, calls the callback with true
    // If fail, calls the callback with false (user already exists or other)
    // Note: Weight in Kilo, Height in CM, DOB in YYYY-MM-DD
    add_patient(username, unencrypt_password, dob, weight, height, information, callback) {
        // Username, DOB, Weight, Height
        var salt = bcrypt.genSaltSync(saltRounds);
        var password = bcrypt.hashSync(unencrypt_password, salt);

        var user_inserts = [username, password, salt];
        var patient_inserts = [username, dob, weight, height, information];
        var add_user_query = mysql.format(add_user_sql, user_inserts);
        var add_patient_query = mysql.format(add_patient_sql, patient_inserts);
        var authorizer = this.authorizer;
        this.pool.getConnection().then(function (connection) {
            connection.query(add_user_query).then(function (results) {
                connection.query(add_patient_query).then(function (results) {
                    var token = jwt.sign({
                        data: {
                            username: username,
                            password_hash: password
                        }
                    }, process.env.JWT_SECRET, {
                        expiresIn: '10d'
                    });
                    connection.release();
                    callback(token);
                }).catch(function (error) {
                    connection.release();
                    callback(false);
                });
            }).catch(function (error) {
                connection.release();
                callback(false);
            })
        }).catch(function (error) {
            callback(false);
            throw err;
        });
    }

    // String (Boolean -> Void) -> Void
    // Tries to purge the patient from the DB
    // Including all session, message, and patient-therapist info
    // If suceed, gives true
    // If fail, gives false (unknown reason, probably server error)
    delete_patient(patientID, callback) {
        var inserts = [patientID];
        var delete_indiv_patient_session_query = mysql.format(delete_indiv_patient_session_sql, inserts);
        this.pool.getConnection().then(function (connection) {
            connection.query(delete_indiv_patient_session_query).then(function (results) {
                var delete_indiv_patient_message_query = mysql.format(delete_indiv_patient_message_sql, inserts);
                connection.query(delete_indiv_patient_message_query).then(function (results) {
                    var delete_indiv_patient_therapist_query = mysql.format(delete_indiv_patient_therapist_sql, inserts);
                    connection.query(delete_indiv_patient_therapist_query).then(function (results) {
                        var delete_indiv_patient_query = mysql.format(delete_indiv_patient_sql, inserts);
                        connection.query(delete_indiv_patient_query).then(function (results) {
                            var delete_indiv_user_query = mysql.format(delete_indiv_user_sql, inserts);
                            connection.query(delete_indiv_user_query).then(function (results) {
                                if (results.affectedRows === 0) {
                                    connection.release();
                                    callback(false);
                                } else {
                                    connection.release();
                                    callback(true);
                                }
                            }).catch(function (error) {
                                connection.release();
                                callback(false);
                            });
                        }).catch(function (error) {
                            connection.release();
                            callback(false);
                        });
                    }).catch(function (error) {
                        connection.release();
                        callback(false);
                    });
                }).catch(function (error) {
                    connection.release();
                    callback(false);
                });
            }).catch(function (error) {
                connection.release();
                callback(false);
            });
        }).catch(function (error) {
            callback(false);
            throw err;
        });
    }

    // String ([Maybe [List-of Session]] -> Void) -> Void
    // Gives all the session info for a given patient
    get_patient_sessions(patientID, callback) {
        var inserts = [patientID];

        var session_query = mysql.format(get_all_patient_sessions_sql, inserts);
        this.pool.getConnection().then(function (connection) {
            connection.query(session_query).then(function (session_results) {
                var session_info = [];
                for (var i = 0; i < session_results.length; i += 1) {
                    session_info.push({
                        score: session_results[i].score,
                        time: session_results[i].time,
                        sessionID: session_results[i].sessionID
                    });
                }
                connection.release();
                callback(session_info);
            }).catch(function (error) {
                connection.release();
                callback(false);
            });
        }).catch(function (error) {
            callback(false);
            throw error;
        });
    }

    // String Number String (Boolean -> Void) -> Void
    // Adds an entry for a session to the DB
    // If suceed, gives true
    // If fail, gives false (server error or already added)
    add_patient_session(patientID, score, time, callback) {
        var inserts = [patientID, score, time];

        var add_patient_session_query = mysql.format(add_patient_session_sql, inserts);
        this.pool.getConnection().then(function (connection) {
            connection.query(add_patient_session_query).then(function (result) {
                connection.release();
                callback(true);
            }).catch(function (error) {
                connection.release();
                callback(false);
            });
        }).catch(function (error) {
            callback(false);
            throw error;
        });
    }

    // String String (Boolean -> Void) -> Void
    // Deletes a given patient session for the DB
    // If suceed, gives true
    // If fail, gives false (server error)
    delete_patient_session(patientID, sessionID, callback) {
        var inserts = [patientID, sessionID];

        var delete_specif_session_query = mysql.format(delete_specif_session_sql, inserts);
        this.pool.getConnection().then(function (connection) {
            connection.query(delete_specif_session_query).then(function (result) {
                if (result.affectedRows === 0) {
                    connection.release();
                    callback(false);
                } else {
                    connection.release();
                    callback(true);
                }
            }).catch(function (error) {
                connection.release();
                callback(false);
            });
        }).catch(function (error) {
            callback(false);
            throw error;
        });
    }

    // String String ([Number] -> Void) -> Void
    // Gives the score for the session at the given time/sessionID (accepts both)
    get_patient_session_specific(patientID, sessionID, callback) {
        var inserts = [patientID, sessionID, sessionID];

        var get_specif_patient_session_query = mysql.format(get_specif_patient_session_sql, inserts);
        this.pool.getConnection().then(function (connection) {
            connection.query(get_specif_patient_session_query).then(function (result) {
                if (result.length == 0) {
                    connection.release();
                    callback(false);
                } else {
                    connection.release();
                    callback({
                        activityLevel: result[0].score,
                        time: result[0].time,
                        id: result[0].sessionID
                    });
                }
            }).catch(function (error) {
                connection.release();
                callback(false);
            });
        }).catch(function (error) {
            callback(false);
            throw error;
        });
    }

    // String String (Maybe-Error Maybe-User -> Void) -> Void
    // Calls the callback with true given a proper login
    // False given an incorrect login
    login(username, unencrypt_password, callback) {
        this.authorizer.login(username, unencrypt_password, callback);
    }

    // String String String String (Boolean -> Void) -> Void
    // Adds a message to this patients database entry
    // Calls the callback with the sucess of the querry
    send_patient_a_message(patientID, therapistID, message, time, callback) {
        var inserts = [patientID, therapistID, message, time];
        var query = mysql.format(add_patient_message_sql, inserts);
        this.pool.getConnection().then(function (connection) {
            connection.query(query).then(function (results) {
                connection.release();
                callback(results.insertId);
            }).catch(function (error) {
                connection.release();
                callback(false);
            });
        }).catch(function (error) {
            callback(false);
            throw error;
        });
    }

    // String
    //([Maybe [List-of Message]] -> Void)
    // -> Void
    // Gives every message that this patient has ever recieved
    get_all_messages_for(patientID, callback) {
        var inserts = [patientID];
        var query = mysql.format(get_all_patient_message_sql, inserts);
        this.pool.getConnection().then(function (connection) {
            connection.query(query).then(function (message_result) {
                var toSend = [];
                if (message_result.length === 0) {
                    connection.release();
                    callback([]);
                }
                for (var a = 0; a < message_result.length; a++) {
                    (function (i) {
                        var reply_inserts = [message_result[i].messageID];
                        var reply_query = mysql.format(get_all_patient_message_replies_sql, reply_inserts);
                        var therapistID = message_result[i].therapistID;
                        var message_content = message_result[i].message;
                        var date_sent = message_result[i].date_sent;
                        var is_read = message_result[i].is_read;
                        var messageID = message_result[i].messageID
                        connection.query(reply_query).then(function (result) {
                            var replies = []
                            for (var x = 0; x < result.length; x++) {
                                replies.push({
                                    sentID: result[x].fromID,
                                    messageID: messageID,
                                    date_sent: result[x].date_sent,
                                    reply_content: result[x].content
                                })
                            }
                            toSend.push({
                                therapistID: therapistID,
                                patientID: patientID,
                                message_content: message_content,
                                date_sent: date_sent,
                                is_read: is_read,
                                messageID: messageID,
                                replies: replies
                            });
                            if (i === message_result.length - 1) {
                                connection.release();
                                callback(toSend);
                            }
                        }).catch(function (error) {
                            connection.release();
                            callback(false);
                        });
                    }(a))
                }
            }).catch(function (error) {
                connection.release();
                callback(false);
            });
        }).catch(function (error) {
            callback(false);
            throw error;
        });
    }

    // String Int (Boolean -> Void) -> Void
    // Marks the given message id as read
    // Gives back whether the querry suceeded or not
    mark_message_as_read(patientID, messageID, callback) {
        var inserts = [patientID, messageID];
        var query = mysql.format(mark_message_as_read_sql, inserts);
        this.pool.getConnection().then(function (connection) {
            connection.query(query).then(function (result) {
                if (result.affectedRows === 0) {
                    connection.release();
                    callback(false);
                } else {
                    connection.release();
                    callback(true);
                }
            }).catch(function (error) {
                connection.release();
                callback(false);
            });
        }).catch(function (error) {
            callback(false);
            throw error;
        });
    }

    // String String (Maybe-Message -> Void) -> Void
    // Returns the info for a specific message
    get_specific_message(patientID, messageID, callback) {
        var message_inserts = [patientID, messageID];
        var message_sql = mysql.format(get_specif_message_sql, message_inserts);

        var reply_inserts = [messageID];
        var reply_sql = mysql.format(get_all_patient_message_replies_sql, reply_inserts);

        this.pool.getConnection().then(function (connection) {
            connection.query(message_sql).then(function (message_result) {
                if (message_result.length === 0) {
                    connection.release();
                    callback(false);
                } else {
                    connection.query(reply_sql).then(function (result) {
                        var replies = [];
                        for (var i = 0; i < result.length; i += 1) {
                            replies.push({
                                sentID: result[i].fromID,
                                messageID: messageID,
                                date_sent: result[i].date_sent,
                                reply_content: result[i].content
                            })
                        }
                        connection.release();
                        callback({
                            therapistID: message_result[0].therapistID,
                            patientID: patientID,
                            message_content: message_result[0].message,
                            date_sent: message_result[0].date_sent,
                            is_read: message_result[0].is_read,
                            messageID: message_result[0].messageID,
                            replies: replies
                        });
                    }).catch(function (error) {
                        connection.release();
                        callback(false);
                    });
                }
            }).catch(function (error) {
                connection.release();
                callback(false);
            });
        }).catch(function (error) {
            callback(false);
            throw error;
        });
    }

    // String String Date (Boolean -> Void) -> Void
    // Pairs this therapist and patinet in the PATIENT_THERAPIST DB
    assign_to_therapist(patientID, therapistID, date_added, callback) {
        var inserts = [patientID, therapistID, date_added];
        var query = mysql.format(add_patient_therapist_join_sql, inserts);
        this.pool.getConnection().then(function (connection) {
            connection.query(query).then(function (error) {
                connection.release();
                callback(true);
            }).catch(function (error) {
                connection.release();
                callback(false);
            });
        }).catch(function (error) {
            callback(false);
            throw error;
        });
    }

    // String String (Boolean -> Void) -> Void
    // Marks this patient-therapist join as accepted
    accept_therapist_request(patientID, therapistID, callback) {
        var inserts = [patientID, therapistID];
        var query = mysql.format(accept_therapist_request_sql, inserts);
        this.pool.getConnection().then(function (connection) {
            connection.query(query).then(function (result) {
                if (result.affectedRows === 0) {
                    connection.release();
                    callback(false);
                } else {
                    connection.release();
                    callback(true);
                }
            }).catch(function (error) {
                connection.release();
                callback(false);
            });
        }).catch(function (error) {
            callback(false);
            throw error;
        });
    }

    // String String Date (Boolean -> Void) -> Void
    // Unpairs this therapist and patinet in the PATIENT_THERAPIST DB
    // DOES NOT delete this pair, simply marks its date_removed as the given date
    unassign_to_therapist(patientID, therapistID, date_removed, callback) {
        var inserts = [date_removed, patientID, therapistID];
        var query = mysql.format(remove_patient_therapist_join_sql, inserts);
        var authorizer = this.authorizer
        this.pool.getConnection().then(function (connection) {
            connection.query(query).then(function (result) {
                if (result.affectedRows === 0) {
                    connection.release();
                    callback(false);
                } else {
                    connection.release();
                    callback(true);
                }
            }).catch(function (error) {
                connection.release();
                callback(false);
            });
        }).catch(function (error) {
            callback(false);
            throw error;
        });
    }

    // String (Boolean -> Void) -> Void
    // Deletes this message
    delete_message(patientID, messageID, callback) {
        var reply_query = mysql.format(delete_message_replies_for_message, [patientID, messageID])
        this.pool.getConnection().then(function (connection) {
            connection.query(reply_query).then(function (result) {
                var message_query = mysql.format(delete_specif_message_sql, [patientID, messageID])
                connection.query(message_query).then(function (result) {
                    if (result.affectedRows === 0) {
                        connection.release();
                        callback(false);
                    } else {
                        connection.release();
                        callback(true);
                    }
                }).catch(function (error) {
                    connection.release();
                    callback(false);
                });
            }).catch(function (error) {
                connection.release();
                callback(false);
            });
        }).catch(function (error) {
            callback(false);
            throw error;
        });
    }

    reply_to_message(sentID, messageID, reply_content, date_sent, callback) {
        var query = mysql.format(add_reply_to_message_sql, [messageID, sentID, date_sent, reply_content]);
        this.pool.getConnection().then(function (connection) {
            connection.query(query).then(function (result) {
                connection.release();
                callback(true);
            }).catch(function (error) {
                connection.release();
                callback(false);
            });
        }).catch(function (error) {
            callback(false);
            throw error;
        });
    }

}

module.exports = PatientDB;