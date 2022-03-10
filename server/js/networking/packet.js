import { PacketHandler } from './packetHandler.js';

export class Packet {

    static PacketTypes = {
        
        "serverResponse": {
            name: "serverResponse",
            handler: (client, packet) => {}
        },
        "welcome": {
            name: "welcome",
            handler: (client, packet) => PacketHandler.HandleWelcomePacket(client, packet)
        },
        "udpTest": {
            name: "udpTest",
            handler: (client, packet) => PacketHandler.HandleUDPTestPacket(client, packet)
        },
        "login": {
            name: "login",
            handler: (client, packet) => PacketHandler.HandleLoginPacket(client, packet)
        }
    }

    constructor(packetType) {
        this.packetType = packetType;
        this.data = [];
        this.requestPacketID = null;
    }

    static CreatePacketByData(jsonData) {
        var packet = new Packet(Packet.PacketTypes[jsonData.type]);
        packet.data = jsonData.data;
        packet.packetID = jsonData.packetID;

        return packet;
    }

    setRequestPacket(packet) {
        this.requestPacketID = packet.packetID;
    }

    write(data) {
        this.data.push(data);
    }

    read() {
        return this.data.pop();
    }

    getJSON() {
        if(this.requestPacketID != null){
            return {
                type: this.packetType.name,
                data: this.data,
                requestPacketID: this.requestPacketID
            }
        }
        else {
            return {
                type: this.packetType.name,
                data: this.data
            }
        }
    }

}