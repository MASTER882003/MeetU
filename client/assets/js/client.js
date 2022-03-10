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

    setUser(user) {
        this.user = user;
        FileLoader.LoadFile("/pages/welcome/welcome.html");
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

    static HandleWelcome(packet) {
        let client = Client.GetInstance();
        //get the client ID
        client.clientID = packet.read("clientID");

        //send udp test packet
        var packet = new Packet(Packet.PacketTypes.udpTest)
        packet.write("message", "UDP Test from client " + client.clientID);

        client.sendUdpData(packet);
    }


    static HandleUDPTest(packet) {
        //TODO
        console.log(packet);
    }

}

class Packet {

    static LastPacketID = 0;

    static PacketTypes = {
        "serverResponse": {
            name: "serverResponse",
            handler: (packet) => {
                if(packet.requestPacket && packet.requestPacket.onResponse) {
                    packet.requestPacket.onResponse(packet);

                    PacketHandler.Packets.delete(packet.requestPacket.packetID);
                }
            }
        },
        "welcome": {
            name: "welcome",
            handler: (packet) => PacketHandler.HandleWelcome(packet)
        },
        "udpTest": {
            name: "udpTest",
            handler: (packet) => PacketHandler.HandleUDPTest(packet)
        },
        "login": {
            name: "login"
        },
        "register": {
            name: "register"
        }
    }

    constructor(packetType) {
        this.packetID = Packet.LastPacketID++;
        this.packetType = packetType;
        this.data = {};
        this.onResponse = null;
    }

    static CreatePacketByData(jsonData) {
        var packet = new Packet(Packet.PacketTypes[jsonData.type]);
        packet.data = jsonData.data;

        if(jsonData.requestPacketID != undefined) {
            var requestPacket = PacketHandler.Packets.get(jsonData.requestPacketID);

            if(requestPacket && requestPacket.onResponse) {
                packet.requestPacket = requestPacket;
            }
        }

        return packet;
    }

    write(name, value) {
        this.data[name] = value;
    }

    read(name) {
        if(this.data[name]) {
            return this.data[name];
        }
        
        return undefined;
    }

    getJSON() {
        return {
            packetID: this.packetID,
            type: this.packetType.name,
            data: this.data,
        }
    }

}