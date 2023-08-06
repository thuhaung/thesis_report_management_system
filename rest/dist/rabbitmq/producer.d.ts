import { Channel } from "amqplib";
export declare class Producer {
    channel: Channel;
    exchangeName: string;
    init(): Promise<void>;
    publishMessage(message: string): Promise<void>;
}
