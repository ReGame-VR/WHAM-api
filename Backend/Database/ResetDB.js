require('dotenv').config();
const mysql = require('mysql');
var fs = require('fs');

class DBReseter {

    constructor(dbName, patientDB) {
        this.pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: "WHAM_TEST",
            multipleStatements: true
        });
        this.patientDB = patientDB;
    }

    // (Boolean -> Void) -> Void
    // Sets the DB schema to the most current one and clears the data
    reset_db(callback) {
        var sql = fs.readFileSync(__dirname + '/schemas' + '/schemas.sql').toString();
        var patientDB = this.patientDB;
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(err, false);
                throw err;
            }
            connection.query(sql, function (error, result) {
                if (error) {
                    callback(null, false);
                } else {
                    patientDB.add_patient("admin", process.env.ADMIN_PASSWORD, "1999-05-05", "160", "71", "", callback);
                }
            });
        });
    }
}

module.exports = DBReseter;