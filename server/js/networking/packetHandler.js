import { Packet } from './packet.js';
import { Server } from './server.js';
import { DBConnector } from '../database.js';

export class PacketHandler {

    static db = null;

    static DB() {
        if(!this.db) {
            this.db = new DBConnector();
        }

        return this.db;
    }

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
        console.log(`UDP TestMessage: '${packet.read()}'`);
    }

    static HandleLoginPacket(client, packet) {
        var username = packet.read();
        var password = packet.read();

        var loginResponsePacket = new Packet(Packet.PacketTypes.serverResponse);
        loginResponsePacket.setRequestPacket(packet);

        if(!username || !password) {
            loginResponsePacket.write("failed");
            client.sendTcpData(loginResponsePacket);
            return;
        }

        var result = this.DB().query("SELECT * FROM user");

        loginResponsePacket.write(result);
        client.sendTcpData(loginResponsePacket);
    }

    static HandleRegisterPacket(client, packet) {
        var username = packet.read();
        var password = packet.read();

        var registerResponespacket = new Packet(Packet.PacketTypes.register);
        registerResponespacket.setRequestPacket(packet);

        if(username == undefined || password == undefined) {
            registerResponespacket.write("failed");
            registerResponespacket.write("Missing Payload");
            client.sendTcpData(registerResponespacket);
            return;
        }

        var usernameCheckResult = this.DB().query(`SELECT id FROM user WHERE username=`)
    }
}