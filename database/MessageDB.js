require('dotenv').config();
const mysql = require('promise-mysql');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var jwt = require('jsonwebtoken');

var message_sql = require("./sql/message_sql.js")

class MessageDB {

    constructor(connection, authorizer) {
        this.pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: "WHAM_TEST"
        });
        this.authorizer = authorizer;
    }

    // String String String String -> Promise(Number)
    // Adds a message to this patients database entry
    send_patient_a_message(patientID, therapistID, message, time) {
        var inserts = [patientID, therapistID, message, time];
        return this.pool.getConnection().then(connection => {
            var query = mysql.format(message_sql.add_patient_message_sql, inserts);
            var res = connection.query(query);
            connection.release();
            return res;
        }).then(result => {
            return result.insertId;
        })
    }

    // String -> Promise([List-of Message])
    // Gives every message that this patient has ever recieved
    get_all_messages_for(patientID) {
        var inserts = [patientID];
        return this.pool.getConnection().then(connection => {
            var query = mysql.format(message_sql.get_all_patient_message_sql, inserts);
            var res = connection.query(query);
            connection.release();
            return res;
        }).then(message_result => {
            var toReturn = [];
            for (var i = 0; i < message_result.length; i++) {
                toReturn.push({
                    therapistID: message_result[i].therapistID,
                    patientID: patientID,
                    message_content: message_result[i].message_content,
                    date_sent: message_result[i].date_sent,
                    is_read: message_result[i].is_read,
                    messageID: message_result[i].messageID,
                });
            }
            return toReturn;
        })
    }

    // String Int -> Promise(Void)
    // Marks the given message id as read
    // Gives back whether the querry suceeded or not
    mark_message_as_read(patientID, messageID) {
        var inserts = [patientID, messageID];
        return this.pool.getConnection().then(connection => {
            var query = mysql.format(message_sql.mark_message_as_read_sql, inserts);
            var res = connection.query(query);
            connection.release();
            return res;
        }).then(result => {
            if (result.affectedRows === 0) {
                throw new Error("Message not found");
            } else {
                return;
            }
        })
    }

    // String String -> Promise(Message)
    // Returns the info for a specific message
    get_specific_message(patientID, messageID) {
        var message_inserts = [patientID, messageID];

        var reply_inserts = [messageID];

        return this.pool.getConnection().then(connection => {
            var message_query = mysql.format(message_sql.get_specif_message_sql, message_inserts);
            var reply_query = mysql.format(message_sql.get_all_patient_message_replies_sql, reply_inserts);
            var res = Promise.all([connection.query(message_query), connection.query(reply_query)])
            connection.release();
            return res
        }).then(([message_result, reply_result]) => {
            if (message_result.length === 0) {
                throw new Error("Message Not Found");
            }
            var replies = [];
            for (var i = 0; i < reply_result.length; i += 1) {
                replies.push({
                    sentID: reply_result[i].fromID,
                    messageID: messageID,
                    date_sent: reply_result[i].date_sent,
                    reply_content: reply_result[i].content
                })
            }
            return {
                therapistID: message_result[0].therapistID,
                patientID: patientID,
                message_content: message_result[0].message,
                date_sent: message_result[0].date_sent,
                is_read: message_result[0].is_read,
                messageID: message_result[0].messageID,
                replies: replies
            };
        });
    }

    // String Number -> Promise(Void)
    // Deletes this message
    delete_message(patientID, messageID) {
        return this.pool.getConnection().then(connection => {
            var message_query = mysql.format(message_sql.delete_specif_message_sql, [patientID, messageID])
            var res = connection.query(message_query);
            connection.release();
            return res;
        }).then(message => {
            if (message.affectedRows === 0) {
                throw new Error("Message not found");
            }
        });
    }

    // String String String Date -> Promise(Void)
    // Sends this reply to this message from this ID
    reply_to_message(sentID, messageID, reply_content, date_sent) {
        return this.pool.getConnection().then(connection => {
            var query = mysql.format(message_sql.add_reply_to_message_sql, [messageID, sentID, date_sent, reply_content]);
            var res = connection.query(query);
            connection.release();
        });
    }

    // String -> Promise([List-of Message])
    // Gives every message that this patient has ever recieved
    get_all_messages_from(therapistID) {
        var inserts = [therapistID];
        var query = mysql.format(message_sql.get_message_from_sql, inserts);
        return this.pool.getConnection().then(connection => {
            var res = connection.query(query);
            connection.release();
            return res;
        }).then(result => {
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
            return toSend;
        });
    }

}

module.exports = MessageDB