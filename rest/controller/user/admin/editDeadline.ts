import { Request, Response } from "express";
import Deadline from "../../../database/Deadline";
import { Model } from "sequelize";

const editDeadline = async (req: Request, res: Response) => {
    const deadline: Model | null = await Deadline.findOne({where: {id: 1}});
    const newDeadline: Date = req.body.new_deadline;

    deadline?.set({deadline: newDeadline});
    deadline?.save().then(() => {
        res.status(200).send("Deadline updated.");
    }).catch(error => {
        console.log(error);
        res.status(500).send("Server error when updating deadline.");
    });
}

export default editDeadline;