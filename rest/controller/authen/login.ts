import { Request, Response } from "express";
import { Model } from "sequelize";
import User from "../../database/User";
import UserType from "../../database/UserType";

const login = async (req: Request, res: Response) => {
    const data = {
        userId: req.body.user_id.toUpperCase() ?? "",
        password: req.body.password
    }

    const user: Model | null = await User.findOne({where: {id: data.userId}});
    const returnData: {[key: string]: string | null} = {};

    if (!user) {
        returnData.message = "User doesn't exist.";
        res.status(401).send(returnData);
    }
    else {
        if (data.password === user.dataValues.password) {
            returnData.message = "Logged in successfuly.";
            const userType: Model | null = await UserType.findOne({where: {id: user.dataValues.type_id}});
            returnData.user_type = userType?.dataValues.type_name;
            res.status(200).send(returnData);
        }
        else {
            returnData.message = "Incorrect user ID or password.";
            res.status(401).send(returnData);
        }
    }
}

export default login;