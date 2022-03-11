import { Packet } from './packet.js';
import { Server } from './server.js';
import { DBConnector } from '../database.js';
import { PathBuilder } from '../pathBuilder.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import fs from 'fs';

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
        console.log("Welcome message from client: " + packet.read("message"));
    }

    static HandleUDPTestPacket(client, packet) {
        console.log(`UDP TestMessage: '${packet.read("message")}'`);
    }

    static HandleLoginPacket(client, packet) {

        var token = packet.read("token");

        var username = packet.read("username");
        var password = packet.read("password");

        var tokenLogin = () => {

            var loginResponsePacket = new Packet(Packet.PacketTypes.serverResponse);
            loginResponsePacket.setRequestPacket(packet);

            var res = this.DB().query(`SELECT id, username, img FROM user WHERE token='${token}'`);

            if(res.length == 0) {
                loginResponsePacket.write("state", "failed");

                client.sendTcpData(loginResponsePacket);
                return;
            }

            //create new token 
            const newToken = crypto.randomBytes(16).toString("hex");
            this.DB().query(`UPDATE user SET token='${newToken}' WHERE id=${res[0].id}`);

            client.user = {
                id: res[0].id,
                username: res[0].username,
                img: res[0].img
            };

            loginResponsePacket.write("state", "success");
            loginResponsePacket.write("user", client.user);
            loginResponsePacket.write("token", newToken);
            client.sendTcpData(loginResponsePacket);
        }

        var normalLogin = async () => {
            var loginResponsePacket = new Packet(Packet.PacketTypes.serverResponse);
            loginResponsePacket.setRequestPacket(packet);
    
            if(!username || !password) {
                loginResponsePacket.write("state", "failed");
                client.sendTcpData(loginResponsePacket);
                return;
            }
    
            username = this.DB().escape(username);
            var result = this.DB().query(`SELECT * FROM user WHERE username='${username}'`);
    
            if(result.length == 0) {
                loginResponsePacket.write("state", "failed");
                loginResponsePacket.write("message", "Username or password wrong");
                client.sendTcpData(loginResponsePacket);
                return;
            }
    
            var pwDB = result[0].password;
            const compare = await bcrypt.compare(password, pwDB);
    
            if(!compare) {
                loginResponsePacket.write("state", "failed");
                loginResponsePacket.write("message", "Username or password wrong");
                client.sendTcpData(loginResponsePacket);
                return;
            }
    
            client.user = {
                id: result[0].id,
                username: result[0].username,
                img: result[0].img
            };
    
            //create login token
            const token = crypto.randomBytes(16).toString("hex");
    
            this.DB().query(`UPDATE user SET token='${token}' WHERE id=${client.user.id}`);
    
            loginResponsePacket.write("state", "success");
            loginResponsePacket.write("user", client.user);
            loginResponsePacket.write("token", token);
    
            client.sendTcpData(loginResponsePacket);
        }

        if(token) {
            tokenLogin();
        }

        else {
            normalLogin();
        }
        
    }

    static async HandleRegisterPacket(client, packet) {
        var username = packet.read("username");
        var password = packet.read("password");

        let registerResponespacket = new Packet(Packet.PacketTypes.serverResponse);
        registerResponespacket.setRequestPacket(packet);

        if(username == undefined || password == undefined) {
            registerResponespacket.write("state", "failed");
            registerResponespacket.write("message", "Missing Payload");
            client.sendTcpData(registerResponespacket);
            return;
        }
        
        if(username == "" || password == "") {
            registerResponespacket.write("state", "failed");
            registerResponespacket.write("message", "Empty username or password");
            client.sendTcpData(registerResponespacket);
            return;
        }

        //escape username and password
        username = this.DB().escape(username);

        var usernameCheckResult = this.DB().query(`SELECT id FROM user WHERE username='${username}' LIMIT 1`);
        //user already exists
        if(usernameCheckResult.length > 0) {
            registerResponespacket.write("state", "failed");
            registerResponespacket.write("message", "User already exists");
            client.sendTcpData(registerResponespacket);
            return;
        }

        const pwHash = await bcrypt.hash(password, 10);
        fs.readdir(PathBuilder.AppendToRoot("/img/pfp/defaultImages"), (err, files) => {

            let profilePicture = "defaultImages/" + files[Math.floor(Math.random()*files.length)];

            this.DB().query(`INSERT INTO user (username, password, img) VALUES ('${username}', '${pwHash}', '${profilePicture}')`);
            registerResponespacket.write("state", "success");

            client.sendTcpData(registerResponespacket);
        });
    }

    static HandleRequestChats(client, packet) {
        var availableChats = [
            {
                name: "Global Chat",
                messages: [],
                participants: []
            }
        ];

        var resPacket = new Packet(Packet.PacketTypes.serverResponse);
        resPacket.setRequestPacket(packet);

        resPacket.write("chats", availableChats);
        client.sendTcpData(resPacket);
    }
}