import net  from 'net';
import dgram  from 'dgram';
import shortid from 'shortid';
import fs from 'fs';

import { Client } from './client.js';
import { PacketHandler } from './packetHandler.js';
import { PathBuilder } from '../pathBuilder.js';

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

export class Server {

    static clients = new Map();

    static Start(tcpPort, udpPort) {

        Server.tcpServer = net.createServer(socket => {
            var client = new Client(shortid.generate());
            client.appendTcpSocket(socket);
            Server.clients.set(client.id, client);

            console.log("New client connected: " + socket.remoteAddress);
        });

        Server.tcpServer.listen(tcpPort, () => {
            console.log("TCP server listening on port " + tcpPort);
        });

        Server.udpServer = dgram.createSocket('udp4');
        Server.udpServer.on('message', (msg, rInfo) => {
            PacketHandler.HandleUDPData(JSON.parse(msg));
        });

        Server.udpServer.bind(udpPort, () => console.log("UDP Server listening on port " + udpPort));

        //startup api for images
        var api = express();
        api.use(cors({
            origin: "*"
        }))
        api.use(bodyParser.json());
        api.get("/pfp", (req, res) => {
            if(req.query.path) {
                var fullPath = PathBuilder.AppendToRoot("/img/pfp/" + req.query.path)
                var found = fs.existsSync(fullPath);

                if(!found) {
                    res.sendStatus(404);
                    return;
                }

                res.sendFile(fullPath, (err) => {});
            }
            else {
                res.sendStatus(402);
            }
        });

        api.listen(8080, () => console.log("API listening on port 8080"));

    }

    static GetClient(clientID) {
        return Server.clients.get(clientID);
    }

}