class Packet {

    static PacketTypes = {
        "welcome": {
            name: "welcome",
            handler: (client, data) => client.handleWelcomePacket(data)
        },
        "udpTest": {
            name: "udpTest",
            handler: (client, data) => client.handleUDPTestPacket(data)
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