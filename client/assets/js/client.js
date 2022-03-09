class Client {

    constructor() {
        this.socket = null;
        this.user = null;
    }

    connect(host, port) {
        this.socket = require('socket.io-client')("http://" + host + ":" + port);
        this.socket.on("connect", () => {
            console.log("Connected to Server...");
        });
    }

    send(event, json) {
        if(this.socket){
            if(this.socket.connected){
                this.socket.emit(event, JSON.stringify(json));
            }
        }

    }
}

module.exports = { Client }