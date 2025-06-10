import { WebSocket, WebSocketServer } from "ws";
import { publisher, subscriber } from "../Redis-Client/pub-sub";
import { v4 as uuidv4} from "uuid";
import  { config } from "dotenv";
config();


const port = process.env.PORT ? Number(process.env.PORT) : 3000
const webSocketServer = new WebSocketServer({ port  });
var NumberOfUsers = 0;
const clientsConnected = new Map();
const Channel = process.env.CHANNEL || "global-channel" ;






subscriber.subscribe(Channel , (message : string ) => {
    console.log("Message recieved from Redis Channel " , Channel);

    for(const ws of clientsConnected.values())
    {
        if( ws.readyState === WebSocket.OPEN )
        {
            ws.send(message);
        }
    }
});




webSocketServer.on("connection", (socket: WebSocket) => {
    console.log("Client connected");
    NumberOfUsers++;
    const Id = uuidv4();
    clientsConnected.set(Id , socket);


    socket.on("message", (message: Buffer) => {
        const payload = JSON.parse(message.toString());
         console.log("Received:", payload);
        
         if(payload.message == "Message")
         {
            publisher.publish(Channel , payload.data);
         }


        
        // webSocketServer.clients.forEach((client) =>{
        //     if(client.readyState == WebSocket.OPEN) // Means Open nd Ready to Communicate
        //     {   
        //         // Currently in BroadCasting Stage
        //         client.send(payload.data);
        //     }
        // })



    });


    socket.on("close", (code: number, reason: string) => {
        // Handling Disconnected Users
        NumberOfUsers--;
        clientsConnected.delete(Id);
        console.log(`User disconnected. Code: ${code}, Reason: ${reason}`);
        console.log("Currently Connected Users:", NumberOfUsers);
    });



    socket.on("error", (err) => {
        console.error("Socket error: at Client " ,   Id , err);
    });
});


// Starting the WebSocker Server
webSocketServer.on("listening", () => {
    console.log("WebSocket server is listening on port " , port);
});

