const mysql = require('mysql');
const bcrypt = require('bcrypt');
const saltRounds = 10;

var jwt = require('jsonwebtoken');

var ACL = require('acl');

class AuthenticationDB {

    constructor() {
        this.pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            socketPath: '/tmp/mysql.sock',
            database: "WHAM_TEST"
        });

        this.acl = new ACL(new ACL.memoryBackend());
        this.acl.allow('admin', '*', '*') // the admin can do anything
    }

    // String String (Maybe-Error Maybe-User -> Void) -> Void
    // Logs this patient in
    // If sucess, gives the salt
    patient_login(username, unencrypt_password, callback) {
        this.general_login("PATIENT", username, unencrypt_password, callback);
    }

    // String String (Maybe-Error Maybe-User -> Void) -> Void
    // Logs this therapist in
    // If sucess, gives the salt
    therapist_login(username, unencrypt_password, callback) {
        this.general_login("THERAPIST", username, unencrypt_password, callback);
    }

    // String String String (Error Maybe-User -> Void) -> Void
    // Tests whether the given login info is valid for the given table
    general_login(table_name, username, unencrypt_password, callback) {
        var get_salt_sql = "SELECT salt FROM " + table_name + " T WHERE T.username = ?";
        var get_salt_insert = [username];
        get_salt_sql = mysql.format(get_salt_sql, get_salt_insert);
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(false);
                throw err;
            }
            connection.query(get_salt_sql, function (error, results, fields) {
                if (error || results.length == 0) {
                    connection.release();
                    callback(false);
                } else {
                    var salt = results[0].salt;
                    try {
                        var password = bcrypt.hashSync(unencrypt_password, salt);
                        console.log(password);
                    } catch(err) {
                        callback(false);
                        return;
                    }
                    var login_sql = "SELECT username FROM " + table_name + " T where T.username = ? AND T.password = ?";
                    var login_insert = [username, password];
                    login_sql = mysql.format(login_sql, login_insert);
                    connection.query(login_sql, function (error, results, fields) {
                        if (error) {
                            connection.release();
                            callback(error, false);
                        } else if (results.length == 0) {
                            connection.release();
                            callback(null, false)
                        } else {
                            var token = jwt.sign({
                                data: {
                                    username: username,
                                    password_hash: password,
                                    type: table_name
                                }
                            }, process.env.JWT_SECRET, {
                                expiresIn: '10d'
                            });

                            connection.release();
                            callback(null, {
                                token: token
                            });
                        }
                    });
                }
            });
        });
    }

    // String String (Maybe-Integer Maybe-String -> Void) -> Void
    // Returns the authorization level of this user
    get_auth_level(salt = 0, table_name, callback) {
        this.get_auth_level_help(salt, table_name, callback, this.pool)
    }


    // String String (Maybe-Integer Maybe-String -> Void) ConnectionPool -> Void
    // Returns the authorization level of this user
    get_auth_level_help(salt = 0, table_name, callback, pool) {
        var sql = "SELECT auth_level, username FROM " + table_name + " WHERE salt = ?";
        sql = mysql.format(sql, [salt]);
        pool.getConnection(function (err, connection) {
            if (err) {
                (callback(false, false))
                throw err;
            }
            connection.query(sql, function (error, result, fields) {
                if (error || result.length == 0) {
                    connection.release();
                    callback(false, false);
                } else {
                    connection.release();
                    callback(result[0].auth_level, result[0].username);
                }
            });
        });
    }

    // Says if this user (patient or therapist) can view this patients info
    // and add messages and change the patient-therapist join info
    // String String (Boolean -> Void) -> Void
    can_view_patient_and_edit_join_and_messages(auth_level, patientID, callback) {
        var get_auth_level_help = this.get_auth_level_help;
        var pool = this.pool;
        this.therapist_can_view_patient(auth_level, patientID, function (can_do) {
            if (can_do) {
                callback(true);
            } else {
                connection.release();
                get_auth_level_help(auth_level, "PATIENT", function (auth_level, username) {
                    callback(username === patientID || auth_level === 3);
                }, pool);
            }
        })
    }

    // String String (Boolean -> Void)
    // Says whether this therapist is authorized to look at this patient
    therapist_can_view_patient(therapist_auth_token, patientID, callback) {
        var sql = `SELECT auth_level, patientID FROM THERAPIST T LEFT JOIN 
                    (SELECT therapistID, patientID FROM PATIENT_THERAPIST PT WHERE PT.patientID = ?) PT
                    ON T.username = PT.therapistID WHERE T.salt = ?`;
        sql = mysql.format(sql, [patientID, therapist_auth_token])
        this.pool.getConnection(function (err, connection) {
            if (err) {
                (callback(false))
                throw err;
            }
            connection.query(sql, function (error, result, fields) {
                if (error || result.length == 0) {
                    connection.release();
                    callback(false);
                } else {
                    connection.release();
                    callback(result[0].patientID !== null || result[0].auth_level == 3);
                }
            });
        });
    }
    
    // Any Any Any -> Void
    // Adds these permissions to acl
    allow(user, stuff, able) {
        this.acl.allow(user, stuff, able);
    }

    // Any Any Any -> Void
    // removed these permissions from acl
    removeAllow(user, stuff, able) {
        this.acl.removeAllow(user, stuff, able);
    }

    // Any Any Any Callback -> Void
    // Passes to acl
    isAllowed(user, stuff, able, callback) {
        if(user === 'admin') {
            callback(null, true);
        } else {
            this.acl.isAllowed(user, stuff, able, callback);
        }
    }

    // Any Any -> Void
    // Adds this role
    addUserRoles(name, role) {
        this.acl.addUserRoles(name, role);
    }

    // String (Maybe-String -> Void)
    // Verifies this jwt and checks if the hash matches the patient id
    // Gives the username if valid
    verifyJWT(token, callback) {
        var decoded = jwt.verify(token, process.env.JWT_SECRET);
        var sql = "SELECT * FROM " + decoded.data.type + " WHERE username = ? AND password = ?";
        sql = mysql.format(sql, [decoded.data.username, decoded.data.password_hash]);
        this.pool.getConnection(function (err, connection) {
            if (err) {
                (callback(false))
                throw err
            }
            connection.query(sql, function (error, result, fields) {
                if (error || result.length == 0) {
                    connection.release();
                    callback(false);
                } else {
                    connection.release();
                    callback(decoded.data.username);
                }
            });
        })
    }

}

module.exports = AuthenticationDB;