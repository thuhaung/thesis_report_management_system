import { Request, Response } from "express";
import Thesis from "../../../database/Thesis";
import Feedback from "../../../database/Feedback";
import { v4 as uuidv4 } from "uuid";
import { Model } from "sequelize";

const giveFeedback = async (req: Request, res: Response) => {
    const thesisId: string = req.body.thesis_id;
    const submission: Model | null = await Thesis.findOne({where: {id: thesisId}});

    if (!submission) {
        res.status(500).send("Submission not found.");
    }
    else {
        const data: {[key: string]: string} = req.body;
        data.id = uuidv4();
        data.submitted_time = (new Date()).toString();

        const instance = Feedback.create(data as any).then(feedbackResponse => {
            res.status(200).send("Feedback sent.");
        }).catch(error => {
            console.log(error.message);
            res.status(500).send("Error inserting new feedback into database.");
        });
    }
}

export default giveFeedback;