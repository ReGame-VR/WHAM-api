const mysql = require('promise-mysql');
const bcrypt = require('bcrypt');
const saltRounds = 10;
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
        this.load_all_permissions();
    }

    // String String String -> Promise(User)
    // Tests whether the given login info is valid for the given table
    login(username, unencrypt_password) {
        var get_salt_insert = [username];
        var password;
        return this.pool.getConnection().then(con => {
            connection = con
            var get_salt_query = mysql.format(get_user_salt_sql, get_salt_insert);
            return connection.query(get_salt_query)
        }).then(results => {
            if (results.length == 0) {
                connection.release();
                throw new Error("User not found");
            } else {
                var salt = results[0].salt;
                password = bcrypt.hashSync(unencrypt_password, salt);
                var login_insert = [username, password];
                var login_query = mysql.format(verify_user_password_sql, login_insert);
                var res = connection.query(login_query);
                connection.release();
                return res;
            }
        }).then(results => {
            if (results.length == 0) {
                throw new Error("Bad password");
            } else {
                return {
                    token: jwt.sign({
                        data: {
                            username: username,
                            password_hash: password
                        }
                    }, process.env.JWT_SECRET, {
                        expiresIn: '10d'
                    })
                };
            }
        });
    }

    // String String -> (list Int String)
    // Returns the authorization level of this user
    get_auth_level(salt = 0) {
        this.get_auth_level_help(salt, this.pool)
    }


    // String String -> (list Int, String)
    // Returns the authorization level of this user
    get_auth_level_help(salt = 0, pool) {
        return pool.getConnection().then(con => {
            var query = mysql.format(get_user_auth_level, [salt]);
            var res = connection.query(query);
            connection.release();
            return res;
        }).then(result => {
            if (result.length == 0) {
                throw new Error("User does not exist");
            } else {
                return [result[0].auth_level, result[0].username];
            }
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

    // String -> Promise(String)
    // Verifies this jwt and checks if the hash matches the patient id
    // Gives the username if valid
    verifyJWT(req) {
        var token;
        if (req.query !== undefined && req.query.auth_token !== undefined) {
            token = req.query.auth_token;
        } else if (req.cookies !== undefined) {
            token = req.cookies.auth_token;
        }
        var decoded;
        return this.pool.getConnection().then(connection => {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            var query = mysql.format(verify_user_password_sql, [decoded.data.username, decoded.data.password_hash]);
            var res = connection.query(query);
            connection.release();
            return res;
        }).then(result => {
            if (result.length == 0) {
                throw new Error("Bad password");
            } else {
                return decoded.data.username;
            }
        });
    }

    // Void -> Promise(Void)
    // When the server is shut down, all permissions are cleared from ACL
    // This method loads them back in based on what is written in the DB
    load_all_permissions() {
        var acl = this.acl;
        return this.pool.getConnection().then(connection => {
            var res = Promise.all(
                [connection.query(get_patients_sql),
                    connection.query(get_therapist_sql),
                    connection.query(get_patient_therapist_join_sql),
                    connection.query(get_messages_sql)
                ])
            connection.release();
            return res;
        }).then(([patients, therapists, join, messages]) => {
            for (var i = 0; i < patients.length; i += 1) {
                acl.addUserRoles(patients[i].username, patients[i].username);
                acl.allow(patients[i].username, patients[i].username, '*')
            }
            for (var i = 0; i < therapists.length; i += 1) {
                acl.addUserRoles(therapists[i].username, therapists[i].username);
                acl.allow(therapists[i].username, therapists[i].username, '*')
            }
            for (var i = 0; i < join.length; i += 1) {
                acl.allow(join[i].therapistID, join[i].patientID, '*')
            }
            for (var i = 0; i < messages.length; i += 1) {
                acl.allow(messages[i].therapistID, " message " + messages[i].messageID, '*') // this user can do anything to the message they want
                acl.allow(messages[i].patientID, " message " + messages[i].messageID, '*') // this user can do anything to the message they want
            }
        });
    }

    // Resets the ACL storage
    // Void -> Void
    reset_self() {
        this.acl = new ACL(new ACL.memoryBackend());
        this.acl.allow('admin', '*', '*') // the admin can do anything
    }
}

module.exports = AuthenticationDB;