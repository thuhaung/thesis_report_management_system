import { Request, Response } from "express";
import User from "../../database/User";
import { Model } from "sequelize";

const getUserInfo = async (req: Request, res: Response) => {
    const userId: string = req.body.user_id.toUpperCase();

    const user: Model | null = await User.findOne({where: {id: userId}});

    if (!user) {
        res.status(400).send("User not found.");
    }
    else {
        res.status(200).send(user.dataValues);
    }
}

export default getUserInfo;