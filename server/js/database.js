const mysql = require('sync-mysql');

class DBConnector {
    constructor() {
        this.connection = new mysql({
            host: 'localhost',
            user: 'root',
            password: '',
            databse: 'db_meetu'
        });
    }

    query(sql) {
        return this.connection.query(sql);
    }
}