import { Request, Response } from "express";
import Thesis from "../../database/Thesis";
import Student from "../../database/Student";
import { Model } from "sequelize";
import { Producer } from "../../rabbitmq/producer";

import { Storage, Bucket, File } from "@google-cloud/storage";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const uploadThesis = async (req: Request, res: Response) => {
    const student: Model | null = await Student.findOne({where: {student_id: req.body.student_id.toUpperCase()}});

    if (req.file?.filename && student) {
        const submission: {[key: string]: string | number} = {
            id: req.file.filename,
            student_id: req.body.student_id.toUpperCase(),
            instructor_id: student.dataValues.instructor_id,
            thesis_name: req.body.thesis_name,
            file_name: req.file.filename
        }
    
        const fileLocation: string = req.file.path;
    
        const storage = new Storage();
        const bucketName: string = process.env.GOOGLE_CLOUD_STORAGE_BUCKET!;
        const bucket: Bucket = storage.bucket(bucketName);
    
        const destination: string = `${process.env.APP_NAME!}/${submission.id}.pdf`;
        const options: {[keys: string]: any} = {
            metadata: {
                contentType: "application/pdf"
            }
        }
    
        const blob: File = bucket.file(destination);
        const uploadStream = blob.createWriteStream(options);
    
        fs.createReadStream(fileLocation).pipe(uploadStream);
    
        uploadStream.on("error", (error) => {
            console.log(error.message);
            res.status(500).send("Error uploading to bucket.");
        });
    
        uploadStream.on("finish", async () => {
            console.log("File uploaded to " + destination + " in bucket.");
    
            submission.file_location = destination;
            submission.submitted_time = (new Date()).toString();
    
            const instance = Thesis.create(submission as any).then(async thesisResponse => {
                const producer: Producer = new Producer();
                await producer.publishMessage(destination);
    
                if (!student.dataValues.has_submitted) {
                    student?.set({has_submitted: true});
                    
                    student?.save().catch(error => {
                        console.log(error.message);
                        res.status(500).send("Error updating student's submission status.");
                    });
                }
    
                await fs.promises.unlink(fileLocation).then(() => {
                    console.log("Unlinked file at " + fileLocation);
                    res.status(200).send(submission.id);
                }).catch(error => {
                    console.log(error);
                    res.status(500).send("Error unlinking file.");
                });

            }).catch(error => {
                console.log(error.message);
                res.status(500).send("Error inserting new thesis into database.");
            });
        });
    }
    else {
        res.status(500).send("Error processing file.");
    }
}

export default uploadThesis;