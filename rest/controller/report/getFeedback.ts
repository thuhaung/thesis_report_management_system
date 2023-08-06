import { Request, Response } from "express";
import Thesis from "../../database/Thesis";
import Feedback from "../../database/Feedback";
import { Model } from "sequelize";

const getFeedback = async (req: Request, res: Response) => {
    const thesisId: string = req.body.thesis_id;
    const submission: Model | null = await Thesis.findOne({where: {id: thesisId}});

    if (!submission) {
        res.status(500).send("Submission not found.");
    }
    else {
        const feedback: Model[] | null = await Feedback.findAll({where: {thesis_id: thesisId}});

        res.status(200).send(feedback);
    }
}

export default getFeedback;