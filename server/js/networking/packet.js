import { PacketHandler } from './packetHandler';

class Packet {

    static PacketTypes = {
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
        this.requestPacket = null;
    }

    static CreatePacketByData(jsonData) {
        var packet = new Packet(Packet.PacketTypes[jsonData.type]);
        packet.data = jsonData.data;

        return packet;
    }

    setRequestPacket(packet) {
        this.requestPacket = packet;
    }

    write(data) {
        this.data.push(data);
    }

    read() {
        return this.data.pop();
    }

    getJSON() {
        if(this.requestPacket){
            return {
                type: this.packetType.name,
                data: this.data,
                requestPacket: this.requestPacket
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

module.exports = { Packet };