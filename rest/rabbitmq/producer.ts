import amqp, { Channel, Connection } from "amqplib";
import dotenv from "dotenv";

dotenv.config();

export class Producer {
    channel: Channel;
    exchangeName: string;

    async init() {
        const connection: Connection = await amqp.connect(process.env.RABBITMQ_HOST!);
        this.channel = await connection.createChannel();
        this.exchangeName = process.env.RABBITMQ_FILE_LOCATION_EXCHANGE!;

        console.log("\nProducer connected to " + this.exchangeName);
    }

    async publishMessage(message: string) {
        if (this.channel === undefined) {
            await this.init();
        }

        await this.channel.assertExchange(this.exchangeName, "fanout", {durable: true});
        this.channel.publish(this.exchangeName, "", Buffer.from(message));

        console.log("\nSent message: " + message);
    }
}


