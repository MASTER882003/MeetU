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

    setUser(user, token = null) {
        this.user = user;

        ChatManager.UserChange();

        if(token != null) {
            IPCRenderer.GetInstance().ipc.send("setSetting", { name: "login_token", value: token });
        }

        //display user on bottom left
        $("#not-logged-in").addClass("hide");
        $("#logged-in").removeClass("hide");

        $("#logged-in .pfp").attr("src", FileLoader.CreateImagePath(user.img));
        $("#logged-in .username").text(user.username);

        WindowManager.Open(() =>  {
            var chatWindow = new ChatWindow();
            
            chatWindow.openChat(ChatManager.GetChat(0));
            chatWindow.window.show();
        });
    }

    connect(host, tcpPort, udpPort) {
        this.tcpPort = tcpPort;
        this.udpPort = udpPort;
        this.host = host;

        //TCP stuff
        this.tcp = new net.Socket();
        this.tcp.connect(tcpPort, host, () =>{
            console.log('Connected to TCP server!');

            var loginToken = IPCRenderer.GetInstance().ipc.sendSync("getSetting", { name: "login_token" });

            if(loginToken != undefined) {
                var loginPacket = new Packet(Packet.ClientPackets.login);
                loginPacket.write("token", loginToken);

                loginPacket.onResponse = (packet) => {
                    if(packet.read("state") == "success") {
                        this.setUser(packet.read("user"), packet.read("token"));
                    }
                    else {
                        IPCRenderer.GetInstance().ipc.send("setSetting", { name: "login_token", value: undefined });
                    }
                }

                this.sendTcpData(loginPacket);
            }
            
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
        var packet = new Packet(Packet.ClientPackets.udpTest)
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

    static ServerPackets = {        
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
        "chat": {
            name: "chat",
            handler: (packet) => ChatManager.HandlePacket(packet)
        }
    }

    static ClientPackets = {
        "login": {
            name: "login"
        },
        "register": {
            name: "register"
        },
        "chat": {
            name: "chat"
        },
        "udpTest": {
            name: "udpTest"
        }
    }

    constructor(packetType) {
        this.packetID = Packet.LastPacketID++;
        this.packetType = packetType;
        this.data = {};
        this.onResponse = null;
    }

    static CreatePacketByData(jsonData) {
        var packet = {};
        if(Packet.ServerPackets[jsonData.type] != undefined) {
            packet = new Packet(Packet.ServerPackets[jsonData.type]);
        }
        else {
            packet = new Packet(Packet.ClientPackets[jsonData.type]);
        }
         
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
        if(this.data[name] != undefined) {
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