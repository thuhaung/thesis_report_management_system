import { Request, Response } from "express";
import Notification from "../../../database/Notification";
import { Model } from "sequelize";

const getAllNotifications = async (req: Request, res: Response) => {
    const notifications: Model[] | null = await Notification.findAll() ?? [];

    if (notifications.length > 0) {
        res.status(200).send(notifications);
    }
    else {
        res.status(500).send("Server error.");
    }
}

export default getAllNotifications;