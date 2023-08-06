import { Channel } from "amqplib";
export declare class Consumer {
    channel: Channel;
    queueName: string;
    init(): Promise<void>;
    listenMessage(): Promise<string[]>;
}
