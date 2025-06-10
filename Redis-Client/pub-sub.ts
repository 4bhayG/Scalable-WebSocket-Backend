import { createClient } from "redis";

export const publisher = createClient(); // 1. Client for publishing to channel
export const subscriber = createClient(); //2 . Client for subscribing

const ClientConnection = async () => 
{
    try {
        await Promise.all([publisher.connect() , subscriber.connect()]);
        console.log("Both Redis Client Connected");
    } catch (error) {
        console.log("Error Connecting Redis Client");
    }

}

ClientConnection();

module.exports = { publisher , subscriber };