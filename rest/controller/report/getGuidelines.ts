import { Request, Response } from "express";
import { Storage, Bucket, File } from "@google-cloud/storage";
import dotenv from "dotenv";
import internal from "stream";

dotenv.config();

const readStreamIntoString = async (stream: internal.Readable) => {
    const chunks = [];

    for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
    }

    return Buffer.concat(chunks).toString("utf-8");
}

const getGuidelines = async (req: Request, res: Response) => {
    const services: string[] = process.env.GUIDELINES_LIST!.split(",") ?? [];

    if (services.length > 0) {
        const data: any = {};

        const storage = new Storage();
        const bucketName: string = process.env.GOOGLE_CLOUD_STORAGE_BUCKET!;
        const bucket: Bucket = storage.bucket(bucketName);

        for (let i = 0; i < services.length; i++) {
            const filePath: string = `requirements/${services[i]}/requirements.txt`;
            const blob: File = bucket.file(filePath);

            await blob.exists().then(async response => {
                if (response[0] === true) {
                    const readStream: internal.Readable = blob.createReadStream();
                    const content: string = await readStreamIntoString(readStream);

                    data[services[i]] = content;
                }
            });
        }

        res.status(200).send(data);
    }
    else {
        res.status(500).send("No services found.");
    }
}

export default getGuidelines;