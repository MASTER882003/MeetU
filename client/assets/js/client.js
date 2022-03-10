const { timeStamp } = require('console');
const net = require('net');

const dgram = require('dgram');

class Client {

    static instance;

    static GetInstance() {
        if(!Client.instance) {
            Client.instance = new Client();
        }

        return Client.instance;
    }

    constructor() {
        this.clientID = null;
        this.host = null;
        this.tcp = null;
        this.udp = null;
        this.user = null;
        this.isConnected = false;
        this.tcpPort = null;
        this.udpPort = null;
    }

    connect(host, tcpPort, udpPort) {
        this.tcpPort = tcpPort;
        this.udpPort = udpPort;
        this.host = host;

        //TCP stuff
        this.tcp = new net.Socket();
        this.tcp.connect(tcpPort, host, () =>{
            console.log('Connected to TCP server!');
        });

        this.tcp.on("data", (data) => {
            console.log(JSON.parse(data.toString()));
            console.log("---------------");
            PacketHandler.PacketReceived(JSON.parse(data.toString()));
        });

        this.tcp.on('close', () => {
            console.log("Connection closed");
        });

        //UDF stuff
        this.udp = dgram.createSocket('udp4');
    }

    sendTcpData(packet) {
        if(this.tcp) {
            this.tcp.write(JSON.stringify(packet.getJSON()));
        }

        if(packet.onResponse) {
            PacketHandler.AddPacket(packet);
        }
    }

    sendUdpData(packet) {
        if(this.udp && this.clientID) {
            this.udp.send(JSON.stringify({
                clientID: this.clientID,
                packet: packet.getJSON()
            }),
            this.udpPort,
            this.host
            );
        }
    }

    handleWelcome(packet) {
        //get the client ID
        this.clientID = packet.read();

        //send udp test packet
        var packet = new Packet(Packet.PacketTypes.udpTest)
        packet.write("UDP Test from client " + this.clientID);

        this.sendUdpData(packet);
    }

    handleUDPTest(packet) {
        console.log(packet);
    }

    handleLogin(packet) {
        
    }
}

class PacketHandler {

    static Packets = new Map();

    static PacketReceived(data) {
        var packet = Packet.CreatePacketByData(data);

        if(packet.packetType.handler) {
            packet.packetType.handler(packet);
        }
        else {
            console.log("No handler for packet " + JSON.stringify(packet.getJSON()));
        }
    }

    static AddPacket(packet) {
       PacketHandler.Packets.set(packet.packetID, packet);
    }

}

class Packet {

    static LastPacketID = 0;

    static PacketTypes = {
        "serverResponse": {
            name: "serverResponse",
            handler: (packet) => {
                console.log(packet);
                if(packet.requestPacketID) {
                    var requestPacket = PacketHandler.Packets.get(packet.requestPacketID);

                    if(requestPacket && requestPacket.onResponse) {
                        requestPacket.onResponse(packet);
                    }
                }
            }
        },
        "welcome": {
            name: "welcome",
            handler: (packet) => Client.GetInstance().handleWelcome(packet)
        },
        "udpTest": {
            name: "udpTest",
            handler: (packet) => Client.GetInstance().handleUDPTest(packet)
        },
        "login": {
            name: "login",
            handler: (packet) => Client.GetInstance().handleLogin(packet)
        }
    }

    constructor(packetType) {
        this.packetID = Packet.LastPacketID++;
        this.packetType = packetType;
        this.data = [];
        this.onResponse = null;
    }

    static CreatePacketByData(jsonData) {
        var packet = new Packet(Packet.PacketTypes[jsonData.type]);
        packet.data = jsonData.data;

        if(jsonData.requestPacketID) {
            packet.requestPacket = jsonData.requestPacket;
        }

        return packet;
    }

    write(data) {
        this.data.push(data);
    }

    read() {
        return this.data.pop();
    }

    getJSON() {
        return {
            packetID: this.packetID,
            type: this.packetType.name,
            data: this.data,
        }
    }

}

module.exports = { Client, Packet }