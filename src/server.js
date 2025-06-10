"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const pub_sub_1 = require("../Redis-Client/pub-sub");
const uuid_1 = require("uuid");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const webSocketServer = new ws_1.WebSocketServer({ port });
var NumberOfUsers = 0;
const clientsConnected = new Map();
const Channel = process.env.CHANNEL || "global-channel";
pub_sub_1.subscriber.subscribe(Channel, (message) => {
    console.log("Message recieved from Redis Channel ", Channel);
    for (const ws of clientsConnected.values()) {
        if (ws.readyState === ws_1.WebSocket.OPEN) {
            ws.send(message);
        }
    }
});
console.log(process.env.PORT, process.env.CHANNEL);
webSocketServer.on("connection", (socket) => {
    console.log("Client connected");
    NumberOfUsers++;
    const Id = (0, uuid_1.v4)();
    clientsConnected.set(Id, socket);
    socket.on("message", (message) => {
        const payload = JSON.parse(message.toString());
        console.log("Received:", payload);
        if (payload.message == "Message") {
            pub_sub_1.publisher.publish(Channel, payload.data);
        }
        // webSocketServer.clients.forEach((client) =>{
        //     if(client.readyState == WebSocket.OPEN) // Means Open nd Ready to Communicate
        //     {   
        //         // Currently in BroadCasting Stage
        //         client.send(payload.data);
        //     }
        // })
    });
    socket.on("close", (code, reason) => {
        // Handling Disconnected Users
        NumberOfUsers--;
        clientsConnected.delete(Id);
        console.log(`User disconnected. Code: ${code}, Reason: ${reason}`);
        console.log("Currently Connected Users:", NumberOfUsers);
    });
    socket.on("error", (err) => {
        console.error("Socket error: at Client ", Id, err);
    });
});
// Starting the WebSocker Server
webSocketServer.on("listening", () => {
    console.log("WebSocket server is listening on port ", port);
});
