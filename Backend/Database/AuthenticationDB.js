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
            database: "WHAM_TEST"
        });

        this.acl = new ACL(new ACL.memoryBackend());
        this.acl.allow('admin', '*', '*') // the admin can do anything
    }

    // String String String (Error Maybe-User -> Void) -> Void
    // Tests whether the given login info is valid for the given table
    login(username, unencrypt_password, callback) {
        var get_salt_sql = "SELECT salt FROM USER T WHERE T.username = ?";
        var get_salt_insert = [username];
        get_salt_sql = mysql.format(get_salt_sql, get_salt_insert);
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(err, false);
                throw err;
            }
            connection.query(get_salt_sql, function (error, results, fields) {
                if (error || results.length == 0) {
                    connection.release();
                    callback(error, false);
                } else {
                    var salt = results[0].salt;
                    var password;
                    try {
                        password = bcrypt.hashSync(unencrypt_password, salt);
                    } catch (err) {
                        callback(err, false);
                        return;
                    }
                    var login_sql = "SELECT username FROM USER T where T.username = ? AND T.password = ?";
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
                                    password_hash: password
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
    get_auth_level(salt = 0, callback) {
        this.get_auth_level_help(salt, callback, this.pool)
    }


    // String String (Maybe-Integer Maybe-String -> Void) ConnectionPool -> Void
    // Returns the authorization level of this user
    get_auth_level_help(salt = 0, callback, pool) {
        var sql = "SELECT auth_level, username FROM USER WHERE salt = ?";
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
        if (user === 'admin') {
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
    verifyJWT(req, callback) {
        var token;
        if (req.query !== undefined && req.query.auth_token !== undefined) {
            token = req.query.auth_token;
        } else if (req.cookies !== undefined) {
            var cookies = req.headers.cookie;
            token = req.cookies.auth_token;
        }
        if (token === undefined) {
            callback(false);
            return;
        }
        try {
            var decoded = jwt.verify(token, process.env.JWT_SECRET);
            var sql = "SELECT * FROM USER WHERE username = ? AND password = ?";
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
            });
        } catch (err) { // The JWT was malformed (probably a fake)
            callback(false);
            return;
        }
    }

    // When the server is shut down, all permissions are cleared from ACL
    // This method loads them back in based on what is written in the DB
    load_all_permissions(callback) {
        var patients_sql = "SELECT username FROM PATIENT";
        var therapist_sql = "SELECT username FROM THERAPIST";
        var join_sql = "SELECT patientID, therapistID from PATIENT_THERAPIST WHERE is_accepted = true";
        var acl = this.acl;
        this.pool.getConnection(function (err, connection) {
            if (err) {
                (callback(false))
                throw err
            }
            connection.query(patients_sql, function (error, result, fields) {
                if (error) {
                    connection.release();
                    callback(false);
                } else {
                    for (var i = 0; i < result.length; i += 1) {
                        acl.addUserRoles(result[i].username, result[i].username);
                        acl.allow(result[i].username, result[i].username, '*')
                    }
                    connection.query(therapist_sql, function (error, result, fields) {
                        if (error) {
                            connection.release();
                            callback(false);
                        } else {
                            for (var i = 0; i < result.length; i += 1) {
                                acl.addUserRoles(result[i].username, result[i].username);
                                acl.allow(result[i].username, result[i].username, '*')
                            }
                            connection.query(join_sql, function (error, result, fields) {
                                if (error) {
                                    connection.release();
                                    callback(false);
                                } else {
                                    for (var i = 0; i < result.length; i += 1) {
                                        acl.allow(result[i].therapistID, result[i].patientID, '*')
                                    }
                                    callback(true);
                                }
                            });
                        }
                    });
                }
            });
        });
    }

    // Sometimes permissions hang between tests, I'm gonna stop that.
    remove_all_permissions(callback) {
        var patients_sql = "SELECT username FROM PATIENT";
        var therapist_sql = "SELECT username FROM THERAPIST";
        var join_sql = "SELECT patientID, therapistID from PATIENT_THERAPIST";
        var acl = this.acl;
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(false)
                throw err
            }
            connection.query(join_sql, function (error, result, fields) {
                if (error) {
                    connection.release();
                    callback(false);
                } else {
                    for (var i = 0; i < result.length; i += 1) {
                        acl.removeAllow(result[i].therapistID, result[i].patientID, '*')
                    }
                    connection.query(patients_sql, function (error, result, fields) {
                        if (error) {
                            connection.release();
                            callback(false);
                        } else {
                            for (var i = 0; i < result.length; i += 1) {
                                acl.removeAllow(result[i].username, result[i].username, '*')
                            }
                            connection.query(therapist_sql, function (error, result, fields) {
                                if (error) {
                                    connection.release();
                                    callback(false);
                                } else {
                                    for (var i = 0; i < result.length; i += 1) {
                                        acl.removeAllow(result[i].username, result[i].username, '*')
                                    }
                                    callback(true);
                                }
                            });
                        }
                    });
                }
            });
        });
    }
}

module.exports = AuthenticationDB;