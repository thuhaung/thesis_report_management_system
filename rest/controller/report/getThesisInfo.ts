import { Request, Response } from "express";
import Thesis from "../../database/Thesis";
import User from "../../database/User";
import { Model } from "sequelize";


const getThesisInfo = async (req: Request, res: Response) => {
    const thesisId: string = req.body.thesis_id;

    const thesis: Model | null = await Thesis.findOne({where: {id: thesisId}});

    if (!thesis) {
        res.status(400).send("Thesis not found.");
    }
    else {
        const user: Model | null = await User.findOne({where: {id: thesis?.dataValues.student_id}});

        const thesisInfo: {[key: string]: string} = {};

        thesisInfo["full_name"] = user?.dataValues.full_name;
        thesisInfo["student_id"] = user?.dataValues.id;

        thesisInfo["thesis_name"] = thesis?.dataValues.thesis_name;
        thesisInfo["submitted_time"] = thesis?.dataValues.submitted_time;

        res.status(200).send(thesisInfo);
    }
}

export default getThesisInfo;