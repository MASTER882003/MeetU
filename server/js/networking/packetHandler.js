const { Packet } = require('./packet');

class PacketHandler {

    static Init() {
        var { Server } = require('./server');
        PacketHandler.Server = Server;
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

        var client = PacketHandler.Server.GetClient(data.clientID);
        var packet = Packet.CreatePacketByData(data.packet);

        if(packet.packetType.handler) {
            packet.packetType.handler(client, packet);
        }
        else {
            console.log("No handler for packet " + JSON.stringify(packet.getJSON()));
        }
    }
}


module.exports = { PacketHandler };