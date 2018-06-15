require('dotenv').config();
const mysql = require('promise-mysql');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var jwt = require('jsonwebtoken');

/********************SQL STATEMENTS*******************/

//GETTING
const get_message_from_sql = "SELECT patientID, message, date_sent, is_read, messageID FROM PATIENT_MESSAGE WHERE therapistID = ?";
const get_all_therapist_info =
    `SELECT T.username, IFNULL(C.c, 0) as c
FROM THERAPIST T LEFT JOIN
(SELECT username, COUNT(*) as c FROM THERAPIST T, PATIENT_THERAPIST PT
where T.username = PT.therapistID AND PT.date_removed IS NULL AND PT.is_accepted = true GROUP BY T.username) C
ON T.username = C.username`;
const get_specif_therapist_info = get_all_therapist_info + ` WHERE T.username = ?`;
const get_therapist_patients_sql =
    `SELECT username, dob, weight, height, information
FROM PATIENT P, PATIENT_THERAPIST PT
WHERE P.username = PT.patientID AND PT.therapistID = ? AND PT.date_removed IS NULL AND is_accepted = true`
const get_patient_recent_sessions_sql = "SELECT score, time FROM PATIENT P JOIN PATIENT_SESSION PS ON P.username = PS.patientID WHERE P.username = ? ORDER BY PS.time DESC";
//DELETING
const delete_therapist_message_sql = "DELETE FROM PATIENT_MESSAGE WHERE therapistID = ?";
const delete_therapist_patient_sql = "DELETE FROM PATIENT_THERAPIST WHERE therapistID = ?";
const delete_therapist_sql = "DELETE FROM THERAPIST WHERE username = ?";
const delete_user_sql = "DELETE FROM USER WHERE username = ?";
//ADDING
const add_user_sql = "INSERT INTO USER VALUES (?, ?, ?, 1)"
const add_therapist_sql = "INSERT INTO THERAPIST VALUES (?)"
//UPDATING

class TherapistDB {

    // Objects:
    // Therapist = String
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

    // String String (Boolean -> Void) -> Void
    // Adds this therapist to the database
    add_therapist(username, unencrypt_password, callback) {
        var salt = bcrypt.genSaltSync(saltRounds);
        var password = bcrypt.hashSync(unencrypt_password, salt);

        var user_inserts = [username, password, salt];
        var therapist_inserts = [username];
        var user_sql = mysql.format(add_user_sql, user_inserts);
        var therapist_sql = mysql.format(add_therapist_sql, therapist_inserts);
        this.pool.getConnection().then(function (connection) {
            connection.query(user_sql).then(function (results) {
                connection.query(therapist_sql).then(function (results) {
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
            });
        }).catch(function (error) {
            callback(false);
            throw err;
        });
    }

    // String String (Maybe-Error Maybe-User -> Void) -> Void
    // Calls the callback with true given a proper login
    // False given an incorrect login
    login(username, unencrypt_password, callback) {
        this.authorizer.login(username, unencrypt_password, callback);
    }

    // String
    //([Maybe [List-of Message]] -> Void)
    // -> Void
    // Gives every message that this patient has ever recieved
    get_all_messages_from(therapistID, callback) {
        var inserts = [therapistID];
        var query = mysql.format(get_message_from_sql, inserts);
        this.pool.getConnection().then(function (connection) {
            connection.query(query).then(function (result) {
                var toSend = [];
                for (var i = 0; i < result.length; i += 1) {
                    toSend.push({
                        patientID: result[i].patientID,
                        message_content: result[i].message,
                        date_sent: result[i].date_sent,
                        is_read: result[i].is_read,
                        messageID: result[i].messageID,
                        therapistID: therapistID
                    });
                }
                connection.release();
                callback(toSend);
            }).catch(function (error) {
                connection.release();
                callback(false);
            });
        }).catch(function (error) {
            callback(false);
            throw err;
        });
    }

    // String (Maybe Therapist -> Void) -> Void
    // Returns just info about this therapist
    get_specific_therapist(therapistID, callback) {
        var query = mysql.format(get_specif_therapist_info, [therapistID]);
        this.pool.getConnection().then(function (connection) {
            connection.query(query).then(function (results) {
                if (results.length === 0) {
                    connection.release();
                    callback(false);
                } else {
                    var toSend = {
                        username: results[0].username,
                        num_patients: results[0].c
                    }
                    connection.release();
                    callback(toSend);
                }
            }).catch(function (error) {
                connection.release();
                callback(false);
            });
        }).catch(function (error) {
            callback(false);
            throw err;
        });
    }

    // (Maybe(List-of (Object String Number) -> Void) -> Void
    // Gives a list of every therapist and the number of patients they have
    get_all_therapists(callback) {
        this.pool.getConnection().then(function (connection) {
            connection.query(get_all_therapist_info).then(function (results) {
                var toSend = [];
                for (var i = 0; i < results.length; i += 1) {
                    toSend.push({
                        username: results[i].username,
                        num_patients: results[i].c
                    });
                }
                connection.release();
                callback(toSend);
            }).catch(function (error) {
                connection.release();
                callback(false);
            });
        }).catch(function (error) {
            callback(false);
            throw err;
        });
    }

    // String (Boolean -> Void) -> Void
    // Deletes this therapist
    delete_therapist(therapistID, callback) {
        var inserts = [therapistID];
        var deleteMessageQuery = mysql.format(delete_therapist_message_sql, inserts);
        var deleteJoinQuery = mysql.format(delete_therapist_patient_sql, inserts);
        var deleteInfoQuery = mysql.format(delete_therapist_sql, inserts);
        var deleteUserQuery = mysql.format(delete_user_sql, inserts);
        this.pool.getConnection().then(function (connection) {
            connection.query(deleteMessageQuery).then(function (result) {
                connection.query(deleteJoinQuery).then(function (result) {
                    connection.query(deleteInfoQuery).then(function (result) {
                        connection.query(deleteUserQuery).then(function (result) {
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

    // String (Listof Patient-Session -> Void) -> Void
    // Return every patient this therapist has
    get_all_patients(therapistID, callback) {
        var inserts = [therapistID];
        var query = mysql.format(get_therapist_patients_sql, inserts);
        this.pool.getConnection().then(function (connection) {
            connection.query(query).then(function (results1) {
                if (results1.length === 0) {
                    connection.release();
                    callback([]);
                } else {
                    var toReturn = [];
                    for (var a = 0; a < results1.length; a += 1) {
                        (function (i) {
                            var username = results1[i].username;
                            var dob = results1[i].dob;
                            var weight = results1[i].weight;
                            var height = results1[i].height;
                            var information = results1[i].information;
                            var query = mysql.format(get_patient_recent_sessions_sql, [username]);
                            connection.query(query).then(function (results2) {
                                var score = undefined;
                                var time = undefined;
                                if (results2.length > 0) {
                                    score = results2[0].score;
                                    time = results2[0].time;
                                }
                                toReturn.push({
                                    username: username,
                                    dob: dob,
                                    weight: weight,
                                    height: height,
                                    information: information,
                                    last_score: score,
                                    last_activity_time: time
                                });
                                if (i === results1.length - 1) {
                                    connection.release();
                                    callback(toReturn);
                                }
                            }).catch(function (error) {
                                connection.release();
                                callback(false);
                            });
                        })(a)
                    }
                }
            }).catch(function (error) {
                connection.release();
                callback(false);
            });
        }).catch(function (error) {
            callback(false);
            throw err;
        });
    }
}

module.exports = TherapistDB;