import { Request, Response } from "express";
import Deadline from "../../../database/Deadline";
import { Model } from "sequelize";

const getDeadline = async (req: Request, res: Response) => {
    const deadline: Model | null = await Deadline.findOne({where: {id: 1}});

    if (deadline) {
        res.status(200).send(deadline.dataValues.deadline);
    }
    else {
        res.status(500).send("Server error.");
    }
}

export default getDeadline;