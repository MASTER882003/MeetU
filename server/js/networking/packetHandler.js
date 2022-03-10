import { Packet } from './packet.js';
import { Server } from './server.js';

export class PacketHandler {

    static HandleTCPData(client, data) {
        var packet = Packet.CreatePacketByData(data);

        if(packet.packetType.handler) {
            packet.packetType.handler(client, packet);
        }
        else {
            console.log("No handler for packet " + JSON.stringify(packet.getJSON()));
        }
    }

    static HandleUDPData(data) {
        if(!data.clientID) {
            //packet is invalid -> no clientID
            return;
        }

        var client = Server.GetClient(data.clientID);
        var packet = Packet.CreatePacketByData(data.packet);

        if(packet.packetType.handler) {
            packet.packetType.handler(client, packet);
        }
        else {
            console.log("No handler for packet " + JSON.stringify(packet.getJSON()));
        }
    }


    static HandleWelcomePacket(client, packet) {
        console.log("Welcome message from client: " + packet.read());
    }

    static HandleUDPTestPacket(client, packet) {
        console.log("UDP TestMessage: " + packet.read());
    }

    static HandleLoginPacket(client, packet) {
        console.log(packet);
    }
}