const { Packet } = require('./packet');
const { PacketHandler } = require('./packetHandler');

class Client {
    constructor(id) {
        this.id = id;
        this.tcp = null;
        this.udp = null;
    }

    appendTcpSocket(socket) {
        this.tcp = socket;

        this.tcp.on("data", data => {
            PacketHandler.HandleTCPData(this, JSON.parse(data.toString()));
        });

        //sending connect packet with the clientID
        var welcomePacket = new Packet(Packet.PacketTypes.welcome);
        welcomePacket.write(this.id);

        this.sendTcpData(welcomePacket);
    }

    appendUdpSocket(socket) {
        this.udp = socket;
    }

    sendTcpData(packet) {
        this.tcp.write(JSON.stringify(packet.getJSON()));
    }

    sendUdpData(packet) {
        this.udp.write(JSON.stringify(packet.getJSON()));
    }


    handleWelcomePacket(packet) {
        console.log("Welcome message from client: " + packet.read());
    }

    handleUDPTestPacket(packet) {
        console.log("UDP TestMessage: " + packet.read());
    }
}


module.exports = { Client };