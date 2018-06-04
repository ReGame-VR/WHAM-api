require('dotenv').config();
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var jwt = require('jsonwebtoken');

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
            socketPath: '/tmp/mysql.sock',
            database: "WHAM_TEST"
        });
        this.authorizer = authorizer;
    }

    // String String (Boolean -> Void) -> Void
    // Adds this therapist to the database
    add_therapist(username, unencrypt_password, callback) {
        var sql = "INSERT INTO THERAPIST VALUES (?, ?, ?, 1)"
        var salt = bcrypt.genSaltSync(saltRounds);
        var password = bcrypt.hashSync(unencrypt_password, salt);

        var inserts = [username, password, salt];
        sql = mysql.format(sql, inserts);
        var authorizer = this.authorizer;
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(false);
                throw err;
            }
            connection.query(sql, function (error, results, fields) {
                if (error) {
                    connection.release();
                    callback(false);
                } else {
                    authorizer.addUserRoles(username, username)
                    authorizer.allow(username, username, '*') // this user can do anything to themselves they want
                    var token = jwt.sign({
                        data: {
                            username: username,
                            password_hash: password,
                            type: "THERAPIST"
                        }
                    }, process.env.JWT_SECRET, {
                        expiresIn: '10d'
                    });
                    connection.release();
                    callback(token);
                }
            });
        });
    }

    // String String (Maybe-Error Maybe-User -> Void) -> Void
    // Calls the callback with true given a proper login
    // False given an incorrect login
    login(username, unencrypt_password, callback) {
        this.authorizer.therapist_login(username, unencrypt_password, callback);
    }

    // String
    //([Maybe [List-of Message]] -> Void)
    // -> Void
    // Gives every message that this patient has ever recieved
    get_all_messages_from(therapistID, callback) {
        var sql = "SELECT patientID, message, date_sent, is_read, messageID FROM PATIENT_MESSAGE WHERE therapistID = ?";
        var inserts = [therapistID];
        sql = mysql.format(sql, inserts);
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(false);
                throw err;
            }
            connection.query(sql, function (error, result, fields) {
                if (error) {
                    connection.release();
                    callback(false);
                } else {
                    var toSend = [];
                    for (var i = 0; i < result.length; i += 1) {
                        toSend.push({
                            patientID: result[i].patientID,
                            message: result[i].message,
                            date_sent: result[i].date_sent,
                            is_read: result[i].is_read,
                            messageID: result[i].messageID,
                            therapistID: therapistID
                        });
                    }
                    connection.release();
                    callback(toSend);
                }
            });
        });
    }

    // String (Maybe Therapist -> Void) -> Void
    // Returns just info about this therapist
    get_specific_therapist(therapistID, callback) {
        var sql = `SELECT T.username, IFNULL(C.c, 0) as c
        FROM THERAPIST T LEFT JOIN 
        (SELECT username, COUNT(*) as c FROM THERAPIST T, PATIENT_THERAPIST PT 
        where T.username = PT.therapistID AND PT.date_removed IS NULL GROUP BY T.username) C
        ON T.username = C.username 
        WHERE T.username = ?`;
        sql = mysql.format(sql, [therapistID]);
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(false);
                throw err;
            }
            connection.query(sql, function (error, results, fields) {
                if (error || results.length === 0) {
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
            });
        });
    }

    // (Maybe(List-of (Object String Number) -> Void) -> Void
    // Gives a list of every therapist and the number of patients they have
    get_all_therapists(callback) {
        var sql = `SELECT T.username, IFNULL(C.c, 0) as c
                FROM THERAPIST T LEFT JOIN 
                (SELECT username, COUNT(*) as c FROM THERAPIST T, PATIENT_THERAPIST PT 
                where T.username = PT.therapistID AND PT.date_removed IS NULL GROUP BY T.username) C
                ON T.username = C.username`;
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(false);
                throw err;
            }
            connection.query(sql, function (error, results, fields) {
                if (error) {
                    connection.release();
                    callback(false);
                } else {
                    var toSend = [];
                    for (var i = 0; i < results.length; i += 1) {
                        toSend.push({
                            username: results[i].username,
                            num_patients: results[i].c
                        });
                    }
                    connection.release();
                    callback(toSend);
                }
            });
        });
    }

    // String (Boolean -> Void) -> Void
    // Deletes this therapist
    delete_therapist(therapistID, callback) {
        var deleteMessageSQL = "DELETE FROM PATIENT_MESSAGE WHERE therapistID = ?";
        var deleteJoinSQL = "DELETE FROM PATIENT_THERAPIST WHERE therapistID = ?";
        var deleteInfoSQL = "DELETE FROM THERAPIST WHERE username = ?";
        var inserts = [therapistID];
        deleteMessageSQL = mysql.format(deleteMessageSQL, inserts);
        deleteJoinSQL = mysql.format(deleteJoinSQL, inserts);
        deleteInfoSQL = mysql.format(deleteInfoSQL, inserts);
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(false);
                throw err;
            }
            connection.query(deleteMessageSQL, function (error, result, fields) {
                if (error) {
                    connection.release();
                    callback(false);
                } else {
                    connection.query(deleteJoinSQL, function (error, result, fields) {
                        if (error) {
                            connection.release();
                            callback(false);
                        } else {
                            connection.query(deleteInfoSQL, function (error, result, fields) {
                                if (error || result.affectedRows === 0) {
                                    connection.release();
                                    callback(false);
                                } else {
                                    connection.release();
                                    callback(true);
                                }
                            });
                        }
                    });
                }
            });
        });
    }

    // String (Listof Patient-Session -> Void) -> Void
    // Return every patient this therapist has
    get_all_patients(therapistID, callback) {
        var safe_sql = `SELECT username, dob, weight, height, information
        FROM PATIENT P, PATIENT_THERAPIST PT
        WHERE P.username = PT.patientID AND PT.therapistID = ? AND PT.date_removed IS NULL`;
        var inserts = [therapistID];
        safe_sql = mysql.format(safe_sql, inserts);
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(false);
                throw err;
            }
            connection.query(safe_sql, function (error, results1, fields) {
                if (error) {
                    connection.release();
                    callback(false);
                } else if(results1.length === 0) {
                    callback([]);
                } else {
                    var toReturn = [];
                    var sqlPt2 = "SELECT score, time FROM PATIENT P JOIN PATIENT_SESSION PS ON P.username = PS.patientID WHERE P.username = ? ORDER BY PS.time DESC";
                    for (var i = 0; i < results1.length; i += 1) {
                        var username = results1[i].username;
                        var dob = results1[i].dob;
                        var weight = results1[i].weight;
                        var height = results1[i].height;
                        var information = results1[i].information;
                        sqlPt2 = mysql.format(sqlPt2, [username]);
                        connection.query(sqlPt2, function (error, results2, fields) {
                            if (error) {
                                connection.release();
                                callback(false);
                                return;
                            }
                            var score = undefined;
                            var time = undefined;
                            if(results2.length > 0) {
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
                            if(i === results1.length) {
                                connection.release();
                                callback(toReturn);
                            }
                        });
                    }
                }
            });
        });
    }
}

module.exports = TherapistDB;