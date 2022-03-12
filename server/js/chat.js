import { Packet } from "./networking/packet.js";
import { Server } from "./networking/server.js";

export class ChatManager {

    static HandlePacket(client, packet) {
        var action = packet.read("action");

        if(action == undefined) {
            return;
        }

        switch(action) {
            case "requestChats": this.HandleRequestChats(client, packet); break;
            case "message": this.HandleChatMessage(client, packet); break;
        }
    }

    static HandleRequestChats(client, packet) {
        var availableChats = [
            {
                id: 0,
                name: "Global Chat",
                messages: [],
                participants: []
            }
        ];

        var resPacket = new Packet(Packet.ServerPackets.serverResponse);
        resPacket.setRequestPacket(packet);

        resPacket.write("chats", availableChats);
        client.sendTcpData(resPacket);
    }

    static HandleChatMessage(client, packet) {

        var chatID = packet.read("chatID");
        var message = packet.read("message");

        if(chatID == undefined || message == undefined){
            return;
        }

        if(chatID == 0) {
            var myPacket = new Packet(Packet.ServerPackets.chat);
            myPacket.write("action", "message");
            myPacket.write("chatID", chatID);
            myPacket.write("message", { content: message, user: client.user })

            Server.SendTcpDataToUsers("all", myPacket);
        }
        
    }

}