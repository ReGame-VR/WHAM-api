const add_user_sql = 
    `INSERT INTO USER VALUES (?, ?, ?, 1)`;

const delete_user_sql = 
    `DELETE FROM USER where username = ?`;

module.exports = {
    add_user_sql: add_user_sql,
    delete_user_sql: delete_user_sql
}