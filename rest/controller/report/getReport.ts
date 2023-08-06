import { Request, Response } from "express";
import Thesis from "../../database/Thesis";
import Event from "../../database/Event";
import { Storage, Bucket, File } from "@google-cloud/storage";
import PDFDocument, { output } from "pdfkit";
import { Model } from "sequelize";
import dotenv from "dotenv";

import formatDataWordFrequency from "./services/wordFrequency";
import formatDataChapterSummarization from "./services/chapterSummarization";
import formatDataPageCount from "./services/pageCount";
import internal from "stream";

dotenv.config();


const readStreamIntoString = async (stream: internal.Readable) => {
    const chunks = [];

    for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
    }

    return Buffer.concat(chunks).toString("utf-8");
}

const getReport = async (req: Request, res: Response) => {
    const thesisId: string = req.body.thesis_id;
    const reportType: string = req.body.report_type;

    const events: Model[] | null = await Event.findAll({where: {thesis_id: thesisId}});

    if (!events) {
        res.status(400).send("Submission doesn't exist");
    }
    else {
        const storage = new Storage();
        const bucketName: string = process.env.GOOGLE_CLOUD_STORAGE_BUCKET!;
        const bucket: Bucket = storage.bucket(bucketName);

        try {
            if (reportType !== "full") {
                const event: Model = events.filter(event => event.dataValues.service_type == reportType)[0];
                const outputLocation: string = event.dataValues.output_location;

                const blob: File = bucket.file(outputLocation);
                const readStream: internal.Readable = blob.createReadStream();

                const content: string = await readStreamIntoString(readStream);
                const dataReturn: any = {text: content};

                switch (reportType) {
                    case "word_frequency":
                        dataReturn.text = formatDataWordFrequency(content);
                        break;

                    case "chapter_summarization":
                        dataReturn.text = formatDataChapterSummarization(content);
                        break;

                    case "page_count":
                        dataReturn.text = formatDataPageCount(content);
                        break;
                }

                res.status(200).send(dataReturn);
            }
            else {
                let content: string = "";
                let blob: File;
                let readStream: internal.Readable;

                for (let i = 0; i < events.length; i++) {
                    const outputLocation: string = events[i].dataValues.output_location;
                    blob = bucket.file(outputLocation);
                    readStream = blob.createReadStream();

                    const text: string = await readStreamIntoString(readStream);
                    content += text + "\n";

                    content += "----------------------------------------------------------------------------------\n";
                }

                const doc = new PDFDocument({
                    margins: {
                        top: 50,
                        bottom: 50,
                        left: 60,
                        right: 60
                    },
                    autoFirstPage: true,
                    bufferPages: true,
                });
                const buffer: any[] = [];
    
                doc.on("data", buffer.push.bind(buffer));
                doc.on("end", () => {
                    const pdf = Buffer.concat(buffer);
    
                    res.setHeader("Content-Disposition", "attachment; filename=report.pdf");
                    res.setHeader("Content-Type", "application/octet stream");
                    res.status(200).send(pdf);
                });
    
                doc.text(content.replace(/\r\n|\r/g, "\n"));
                doc.end();
            }
        } catch (error) {
            console.log(error);
            res.status(500).send({error: "Report still loading/Error reading report."});
        }
    }
}

export default getReport;