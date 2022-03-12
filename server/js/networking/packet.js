import { ChatManager } from '../chat.js';
import { PacketHandler } from './packetHandler.js';

export class Packet {

    static ServerPackets = {
        "serverResponse": { name: "serverResponse", },
        "welcome": { name: "welcome" },
        "chat": { name: "chat"}
    }

    static ClientPackets = {
        
        "login": {
            name: "login",
            handler: (client, packet) => PacketHandler.HandleLoginPacket(client, packet)
        },
        "register": {
            name: "register",
            handler: (client, packet) => PacketHandler.HandleRegisterPacket(client, packet)
        },
        "chat": {
            name: "chat",
            handler: (client, packet) => ChatManager.HandlePacket(client, packet)
        },
        "udpTest": {
            name: "udpTest",
            handler: (client, packet) => PacketHandler.HandleUDPTestPacket(client, packet)
        }
    }

    constructor(packetType) {
        this.packetType = packetType;
        this.data = {};
        this.requestPacketID = null;
    }

    static CreatePacketByData(jsonData) {
        var packet = new Packet(Packet.ClientPackets[jsonData.type]);
        packet.data = jsonData.data;
        packet.packetID = jsonData.packetID;

        return packet;
    }

    setRequestPacket(packet) {
        this.requestPacketID = packet.packetID;
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