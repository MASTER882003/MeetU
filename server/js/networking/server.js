const net = require('net');
const dgram = require('dgram');
var shortid = require('shortid');

const { Client } = require('./client');
const { PacketHandler } = require('./packetHandler');

class Server {

    static clients = new Map();

    static Start(tcpPort, udpPort) {

        PacketHandler.Init();

        Server.tcpServer = net.createServer(socket => {
            var client = new Client(shortid.generate());
            client.appendTcpSocket(socket);
            Server.clients.set(client.id, client);

            console.log("New client connected: " + socket.remoteAddress);
        });

        Server.tcpServer.listen(tcpPort, () => {
            console.log("TCP server listening on port " + tcpPort);
        });

        Server.udpServer = dgram.createSocket('udp4');
        Server.udpServer.on('message', (msg, rInfo) => {
            PacketHandler.HandleUDPData(JSON.parse(msg));
        });

        Server.udpServer.bind(udpPort, () => console.log("UDP Server listening on port " + udpPort));

    }

    static GetClient(clientID) {
        return Server.clients.get(clientID);
    }

}

module.exports = { Server };