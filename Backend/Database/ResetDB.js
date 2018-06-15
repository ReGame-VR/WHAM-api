require('dotenv').config();
const mysql = require('promise-mysql');
var fs = require('fs');

var connection;

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
        this.pool.getConnection().then(function (con) {
            connection = con
            return connection.query(sql)
        }).then(function (result) {
            patientDB.add_patient("admin", process.env.ADMIN_PASSWORD, "1999-05-05", "160", "71", "", callback);
        }).catch(function (error) {
            if (connection !== undefined && connection && connection.release) {
                connection.release();
            }
            callback(false);
        });
    }
}

module.exports = DBReseter;
