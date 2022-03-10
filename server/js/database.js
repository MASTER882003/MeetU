import mysql  from 'sync-mysql';

export class DBConnector {
    constructor() {
        this.connection = new mysql({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'db_meetu'
        });
    }

    query(sql) {
        return this.connection.query(sql);
    }

    escape(text) {
        
    }
}