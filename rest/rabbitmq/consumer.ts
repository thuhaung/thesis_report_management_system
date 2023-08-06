import amqp, { Channel, Connection } from "amqplib";
import dotenv from "dotenv";
import Event from "../database/Event";
import { ConsumeMessage } from "amqplib";

dotenv.config();

export class Consumer {
    channel: Channel;
    queueName: string;

    async init() {
        const connection: Connection = await amqp.connect(process.env.RABBITMQ_HOST!);
        this.channel = await connection.createChannel();
        this.queueName = process.env.RABBITMQ_OUTPUT_LOCATION_EXCHANGE!;

        console.log("\nConsumer connected to " + this.queueName);
    }

    async listenMessage() {
        if (this.channel === undefined) {
            await this.init();
        }

        const exchange = await this.channel.assertExchange(this.queueName, "direct", {durable: true});
        const queue = await this.channel.assertQueue(this.queueName, {durable: true});

        await this.channel.bindQueue(this.queueName, this.queueName, this.queueName);

        this.channel.consume(this.queueName, async (message: ConsumeMessage | null) => {

            if (message) {
                let payload: {[key: string]: string} = JSON.parse(message.content.toString());
                console.log("\nReceived message from " + payload["service_type"] + " for event " + payload["id"] + "\n");

                Event.findOne({where: {id: payload["id"]}}).then(async event => {
                    if (event) {
                        if (payload["service_status"] !== "Service error") {
                            event.update({service_status: payload["service_status"], output_location: payload["output_location"], result: payload["result"]});
                        }
                        else {
                            event.update({status: payload["service_status"]});
                        }
                    }
                    else {
                        const event = Event.create(payload as any).then(async insert => {
                            console.log("New event inserted from " + payload["service_type"] + " for event " + payload["id"] + "\n");
                        }).catch(error => {
                            console.log(error);
                        });
                    }
                }).catch(error => {
                    console.log(error);
                });
            }

            this.channel.ack(message!);
        });
    }
}


