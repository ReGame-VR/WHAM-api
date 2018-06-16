const mysql = require('promise-mysql');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const handle_error = require('../helpers/db-helper.js');
var jwt = require('jsonwebtoken');

var ACL = require('acl');

/********************SQL STATEMENTS*******************/
const get_user_salt_sql = "SELECT salt FROM USER T WHERE T.username = ?";
const verify_user_password_sql = "SELECT * FROM USER T where T.username = ? AND T.password = ?";
const get_user_auth_level = "SELECT auth_level, username FROM USER WHERE salt = ?";

const get_patients_sql = "SELECT * FROM PATIENT";
const get_therapist_sql = "SELECT * FROM THERAPIST";
const get_patient_therapist_join_sql = "SELECT * from PATIENT_THERAPIST WHERE is_accepted = true";
const get_messages_sql = "SELECT * FROM PATIENT_MESSAGE";

var connection;

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

        // Resets the ACL permissions based on the DB entries
        this.load_all_permissions(function (worked) {
            
        });
    }

    // String String String (Error Maybe-User -> Void) -> Void
    // Tests whether the given login info is valid for the given table
    login(username, unencrypt_password, callback) {
        var get_salt_insert = [username];
        var password;
        this.pool.getConnection().then(function (con) {
            connection = con
            var get_salt_query = mysql.format(get_user_salt_sql, get_salt_insert);
            return connection.query(get_salt_query)
        }).then(function (results) {
            if (results.length == 0) {
                throw new Error("User not found");
            } else {
                var salt = results[0].salt;
                password = bcrypt.hashSync(unencrypt_password, salt);
                var login_insert = [username, password];
                var login_query = mysql.format(verify_user_password_sql, login_insert);
                return connection.query(login_query)
            }
        }).then(function (results) {
            if (results.length == 0) {
                throw new Error("Bad password");
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
        }).catch(function (error) {
            handle_error(error, connection, callback);
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
        pool.getConnection().then(function (con) {
            connection = con;
            var query = mysql.format(get_user_auth_level, [salt]);
            return connection.query(query);
        }).then(function (result) {
            if (result.length == 0) {
                throw new Error("User does not exist");
            } else {
                connection.release();
                callback(result[0].auth_level, result[0].username);
            }
        }).catch(function (error) {
            handle_error(error, connection, callback);
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
        var decoded;
        this.pool.getConnection().then(function (con) {
            connection = con
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            var query = mysql.format(verify_user_password_sql, [decoded.data.username, decoded.data.password_hash]);
            return connection.query(query);
        }).then(function (result) {
            if (result.length == 0) {
                throw new Error("Bad password");
            } else {
                connection.release();
                callback(decoded.data.username);
            }
        }).catch(function (error) {
            handle_error(error, connection, callback);
        });
    }

    // When the server is shut down, all permissions are cleared from ACL
    // This method loads them back in based on what is written in the DB
    load_all_permissions(callback) {
        var acl = this.acl;
        this.pool.getConnection().then(function (con) {
            connection = con;
            return connection.query(get_patients_sql);
        }).then(function (result) {
            for (var i = 0; i < result.length; i += 1) {
                acl.addUserRoles(result[i].username, result[i].username);
                acl.allow(result[i].username, result[i].username, '*')
            }
            return connection.query(get_therapist_sql)
        }).then(function (result) {
            for (var i = 0; i < result.length; i += 1) {
                acl.addUserRoles(result[i].username, result[i].username);
                acl.allow(result[i].username, result[i].username, '*')
            }
            return connection.query(get_patient_therapist_join_sql)
        }).then(function (result) {
            for (var i = 0; i < result.length; i += 1) {
                acl.allow(result[i].therapistID, result[i].patientID, '*')
            }
            return connection.query(get_messages_sql)
        }).then(function (result) {
            for (var i = 0; i < result.length; i += 1) {
                acl.allow(result[i].therapistID, " message " + result[i].messageID, '*') // this user can do anything to the message they want
                acl.allow(result[i].patientID, " message " + result[i].messageID, '*') // this user can do anything to the message they want
            }
            connection.release();
            callback(true);
        }).catch(function (error) {
            handle_error(error, connection, callback);
        });
    }

    // Resets the ACL storage
    // (Boolean -> Void) -> Void
    reset_self(worked) {
        this.acl = new ACL(new ACL.memoryBackend());
        this.acl.allow('admin', '*', '*') // the admin can do anything
        worked(true);
    }
}

module.exports = AuthenticationDB;