const mysql = require('promise-mysql');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var jwt = require('jsonwebtoken');

/********************SQL STATEMENTS*******************/
const get_user_salt_sql = "SELECT salt FROM USER T WHERE T.username = ?";
const verify_user_password_sql = "SELECT * FROM USER T where T.username = ? AND T.password = ?";

const get_therapist_patient_sql = "SELECT patientID from PATIENT_THERAPIST WHERE is_accepted = true AND therapistID = ? AND patientID = ?";
const get_message_sender_and_receiver_sql = "SELECT patientID, therapistID FROM PATIENT_MESSAGE PM WHERE PM.messageID = ?"

class AuthenticationDB {

    constructor() {
        this.pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: "WHAM_TEST"
        });
    }

    // String String -> Promise(JWT)
    // Tests whether the given login info is valid for the given table
    login(username, unencrypt_password, type) {
        var get_salt_insert = [username];
        var password;
        var connection;
        return this.pool.getConnection().then(con => {
            connection = con
            return verifyType(username, type, connection);
        }).then(is_of_type => {
            if(is_of_type === false) {
                throw new Error("Does not match type");
            }
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

    // String String -> Promise(Boolean)
    // Says if this user can view this patient
    canViewPatient(user, patient) {
        // Either they are the patient, the admin, or a therapist joined to the patient
        return this.pool.getConnection().then(connection => {
            var get_patients_query = mysql.format(get_therapist_patient_sql, [user, patient]);
            var res = connection.query(get_patients_query)
            connection.release()
            return res
        }).then(patients => {
            return patients.length > 0 || user === patient || isAdmin(user)
        }).catch(error => {
            return false
        })
    }

    // String String -> Promise(Boolean)
    // Says if this user can view this therapist
    canViewTherapist(user, therapist) {
        return new Promise(function (resolve, reject) {
            resolve(user === therapist || isAdmin(user))
        });
    }

    // String Int -> Promise(Boolean)
    // Says if this user can view this message
    canViewMessage(user, messageID) {
        // Either they sent the message or recieved it
        return this.pool.getConnection().then(connection => {
            var get_message_query = mysql.format(get_message_sender_and_receiver_sql, [messageID]);
            var res = connection.query(get_message_query)
            connection.release()
            return res
        }).then(message => {
            return (message.length > 0 && (message[0].patientID === user || message[0].therapistID === user))
             || isAdmin(user)
        }).catch(error => {
            return false
        })
    }

    // String -> Promise(Boolean)
    // Says if this user is an admin
    hasAdminPriv(user) {
        return new Promise(function (resolve, reject) {
            resolve(isAdmin(user))
        });
    }
}

// String -> Boolean
// Says if this user is an admin
function isAdmin(user) {
    return user === 'admin'
}

// String String Connection -> Promise(Boolean)
// Verifies if this user is of the said type
function verifyType(username, type, conn) {
    if(type === "patient") {
        var get_message_query = mysql.format("SELECT * FROM PATIENT where username = ?", [username]);
        return conn.query(get_message_query).then(res => {
            return res.length > 0;
        })
    } else if(type === "therapist") {
        var get_message_query = mysql.format("SELECT * FROM THERAPIST where username = ?", [username]);
        return conn.query(get_message_query).then(res => {
            return res.length > 0;
        })
    } else {
        throw new Error("Invalid type");
    }
}

module.exports = AuthenticationDB;