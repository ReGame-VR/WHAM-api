require('dotenv').config();
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const saltRounds = 10;

class PatientDB {


    constructor(dbName) {
        this.connection = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: dbName
        });

        this.connection.connect(function (err) {
            if (err) throw err;
        });
    }

    // (Boolean -> Void) -> Void
    // Deletes all patients from the DB
    // If suceed, calls the callback with true
    // If fail, calls the callback with false (server error or other)
    delete_all_patient_info(callback) {
        var sql = "DELETE FROM PATIENT_SESSION";
        var connection = this.connection;
        connection.query(sql, function (error, results, fields) {
            if (error) {
                callback(false);
            } else {
                var sql = "DELETE FROM PATIENT_MESSAGE";
                connection.query(sql, function (error, results, fields) {
                    if (error) {
                        throw error;
                        callback(false);
                    } else {
                        var sql = "DELETE FROM PATIENT_THERAPIST";
                        connection.query(sql, function (error, results, fields) {
                            if (error) {
                                callback(false);
                            } else {
                                var sql = "DELETE FROM PATIENT";
                                connection.query(sql, function (error, results, fields) {
                                    if (error) {
                                        callback(false);
                                    } else {
                                        callback(true);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    // ([List-of String] -> Void) -> Void
    // Calls the callback with the usernames of every patient
    get_all_patient_info(callback) {
        var sql = "SELECT username FROM PATIENT";
        this.connection.query(sql, function (error, results, fields) {
            if (error) {
                callback([]);
            } else {
                var toReturn = [];
                for (var i = 0; i < results.length; i += 1) {
                    toReturn.push(results[i].username);
                }
                callback(toReturn);
            }
        });
    }

    // String ([Maybe  //False if user does not exist
    //  (list String Date Number Number String)  // User Info
    //  [List-of (list Number DateTime )]  //Session Info
    //  [List-of (list String Date Boolean)]]  //Message Info
    //  -> Void) 
    //  -> Void
    // Gives all information for the given patient
    get_patient_info(username, callback) {
        var inserts = [username];
        var info_query = "SELECT username, dob, weight, height, information FROM PATIENT P WHERE P.username = ?";
        info_query = mysql.format(info_query, inserts);

        var session_query = "SELECT score, time FROM PATIENT_SESSION PS WHERE PS.patientID = ?";
        session_query = mysql.format(session_query, inserts);

        var message_query = "SELECT message, date_sent, is_read FROM PATIENT_MESSAGE PM WHERE PM.patientID = ?";
        message_query = mysql.format(message_query, inserts);

        var connection = this.connection;

        connection.query(info_query, function (error1, info_results, fields) {
            if (error1 || info_results.length == 0) {
                callback(false, false, false);
            } else {
                var user_info = [info_results[0].username, info_results[0].dob, info_results[0].weight, info_results[0].height, info_results[0].information];
                connection.query(session_query, function (error2, session_results, fields) {
                    if (error2) {
                        callback(false, false, false);
                    } else {
                        var session_info = [];
                        for (var i = 0; i < session_results.length; i += 1) {
                            session_info.push([session_results[i].score, session_results[i].time]);
                        }
                        connection.query(message_query, function (error3, message_results, fields) {
                            if (error3) {
                                callback(false, false, false);
                            } else {
                                var message_info = []
                                for (var i = 0; i < message_results.length; i += 1) {
                                    message_info.push([message_results[i].message, message_results[i].date_sent, message_results[i].is_read]);
                                }
                                callback(user_info, session_info, message_info);
                            }
                        });
                    }
                });
            }
        });

    }

    // String String String Number Number String (Boolean -> Void) -> Void
    // Tries to add the patient to the database
    // If suceed, calls the callback with true
    // If fail, calls the callback with false (user already exists or other)
    // Note: Weight in Kilo, Height in CM, DOB in YYYY-MM-DD
    add_patient(username, unencrypt_password, dob, weight, height, information, callback) {
        // Username, password, salt, DOB, Weight, Height, (?) Information
        var sql = "INSERT INTO PATIENT VALUES (?, ?, ?, ?, ?, ?, ?)"
        var salt = bcrypt.genSaltSync(saltRounds);
        var password = bcrypt.hashSync(unencrypt_password, salt);

        var inserts = [username, password, salt, dob, weight, height, information];
        sql = mysql.format(sql, inserts);
        this.connection.query(sql, function (error, results, fields) {
            if (error) {
                callback(false);
            } else {
                callback(true);
            }
        });
    }

    // String (Boolean -> Void) -> Void
    // Tries to purge the patient from the DB 
    // Including all session, message, and patient-therapist info
    // If suceed, gives true
    // If fail, gives false (unknown reason, probably server error)
    delete_patient(patientID, callback) {
        var inserts = [patientID];
        var sql = "DELETE FROM PATIENT_SESSION WHERE patientID = ?";
        sql = mysql.format(sql, inserts);
        console.log(sql);
        var connection = this.connection;
        connection.query(sql, function (error, results) {
            if (error) {
                throw error;
                callback(false);
            } else {
                var sql = "DELETE FROM PATIENT_MESSAGE WHERE patientID = ?";
                sql = mysql.format(sql, inserts);
                connection.query(sql, function (error, results) {
                    if (error) {
                        callback(false);
                    } else {
                        var sql = "DELETE FROM PATIENT_THERAPIST WHERE patientID = ?";
                        sql = mysql.format(sql, inserts);
                        connection.query(sql, function (error, results) {
                            if (error) {
                                callback(false);
                            } else {
                                var sql = "DELETE FROM PATIENT where username = ?";
                                sql = mysql.format(sql, inserts);
                                connection.query(sql, function (error, results) {
                                    if (error) {
                                        callback(false);
                                    } else {
                                        callback(true);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    // String ([Maybe [List-of (list Number DateTime)]] -> Void) -> Void
    // Gives all the session info for a given patient
    get_patient_sessions(patientID, callback) {
        var inserts = [patientID];

        var session_query = "SELECT score, time FROM PATIENT_SESSION PS WHERE PS.patientID = ?";
        session_query = mysql.format(session_query, inserts);

        this.connection.query(session_query, function (error2, session_results, fields) {
            if (error2) {
                callback(false);
            } else {
                var session_info = [];
                for (var i = 0; i < session_results.length; i += 1) {
                    session_info.push([session_results[i].score, session_results[i].time]);
                }
                callback(session_info);
            }
        });
    }

    // String Number String (Boolean -> Void) -> Void
    // Adds an entry for a session to the DB
    // If suceed, gives true
    // If fail, gives false (server error or already added)
    add_patient_session(patientID, score, time, callback) {
        var sql = "INSERT INTO PATIENT_SESSION VALUES (?, ?, ?)"
        var inserts = [patientID, score, time];

        sql = mysql.format(sql, inserts);

        this.connection.query(sql, function (error, result, fields) {
            if (error) {
                callback(false);
            } else {
                callback(true);
            }
        });
    }

    // String String (Boolean -> Void) -> Void
    // Deletes a given patient session for the DB
    // If suceed, gives true
    // If fail, gives false (server error)
    delete_patient_session(patientID, time, callback) {
        var sql = "DELETE FROM PATIENT_SESSION WHERE patientID = ? AND time = ?";
        var inserts = [patientID, time];

        sql = mysql.format(sql, inserts);
        this.connection.query(sql, function (error, result, fields) {
            if (error) {
                callback(false);
            } else {
                callback(true);
            }
        });
    }

    // String String ([Number] -> Void) -> Void
    // Gives the score for the session at the given time
    get_patient_session_specific(patientID, time, callback) {
        var sql = "SELECT score FROM PATIENT_SESSION WHERE patientID = ? AND time = ?"
        var inserts = [patientID, time];

        sql = mysql.format(sql, inserts);
        this.connection.query(sql, function (error, result, fields) {
            if (error || result.length == 0) {
                callback(false);
            } else {
                callback(result[0].score);
            }
        });
    }

    // String String (Boolean -> Void) -> Void
    // Calls the callback with true given a proper login
    // False given an incorrect login
    login(username, unencrypt_password, callback) {
        var get_salt_sql = "SELECT salt FROM PATIENT P WHERE P.username = ?";
        var get_salt_insert = [username];
        get_salt_sql = mysql.format(get_salt_sql, get_salt_insert);
        var loginFunc = this._login;
        var connection = this.connection;
        connection.query(get_salt_sql, function (error, results, fields) {
            if (error || results.length == 0) {
                callback(false);
            } else {
                var salt = results[0].salt;
                var password = bcrypt.hashSync(unencrypt_password, salt);
                var login_sql = "SELECT username FROM PATIENT P where P.username = ? AND P.password = ?";
                var login_insert = [username, password];
                login_sql = mysql.format(login_sql, login_insert);
                connection.query(login_sql, function (error, results, fields) {
                    if (error || results.length == 0) {
                        callback(false);
                    } else {
                        callback(true);
                    }
                });
            }
        });
    }

    // String
    //([Maybe [List-of (list String String Date Boolean Int)]] -> Void)
    // -> Void
    // Gives every message that this patient has ever recieved
    get_all_messages_for(patientID, callback) {
        var sql = "SELECT therapistID, message, date_sent, is_read, messageID FROM PATIENT_MESSAGE WHERE patientID = ?";
        var inserts = [patientID];
        sql = mysql.format(sql, inserts);
        this.connection.query(sql, function (error, result, fields) {
            if (error) {
                callback(false);
            } else {
                var toSend = [];
                for (var i = 0; i < result.length; i += 1) {
                    toSend.push([result[i].therapistID, result[i].message, result[i].date_sent, result[i].is_read, result[i].messageID]);
                }
                callback(toSend);
            }
        });
    }

    // String Int (Boolean -> Void) -> Void
    // Marks the given message id as read
    // Gives back whether the querry suceeded or not
    mark_message_as_read(patientID, messageID, callback) {
        var sql = "UPDATE PATIENT_MESSAGE SET is_read = true WHERE patientID = ? AND messageID = ?";
        var inserts = [patientID, messageID];
        sql = mysql.format(sql, inserts);

        this.connection.query(sql, function (error, result, fields) {
            if (error) {
                callback(false);
            } else {
                callback(true);
            }
        });
    }

}

module.exports = PatientDB;