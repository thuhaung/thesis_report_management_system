import { Request, Response } from "express";
import Thesis from "../../database/Thesis";
import { Model } from "sequelize";
import { Storage, Bucket, File } from "@google-cloud/storage";

import dotenv from "dotenv";

dotenv.config();

const downloadFile = async (req: Request, res: Response) => {
    const thesisId: string = req.body.thesis_id;
    
    const thesis: Model | null = await Thesis.findOne({where: {id: thesisId}});

    if (!thesis) {
        res.status(400).send("Thesis not found.");
    }
    else {
        const fileName: string = thesis.dataValues.file_name;

        const filePath: string = `${process.env.APP_NAME}/${fileName}.pdf`;

        const storage = new Storage();
        const bucketName: string = process.env.GOOGLE_CLOUD_STORAGE_BUCKET!;
        const bucket: Bucket = storage.bucket(bucketName);

        try {
            const blob: File = bucket.file(filePath);
            const readStream = blob.createReadStream();

            res.setHeader("Content-Type", "application/pdf");
            readStream.pipe(res);
            res.status(200);
        } catch (error) {
            console.log(error);
            res.status(500).send("Error sending file.");
        }
    }
}

export default downloadFile;