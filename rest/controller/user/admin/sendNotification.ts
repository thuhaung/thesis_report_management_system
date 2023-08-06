import { Request, Response } from "express";
import Notification from "../../../database/Notification";
import { Model } from "sequelize";

const sendNotification = async (req: Request, res: Response) => {
    const notification: {[key: string]: any} = req.body.notification;
    notification.submitted_time = new Date();

    Notification.create(notification as any).then(() => {
        res.status(200).send("Notification sent to students and instructors.");
    }).catch(error => {
        console.log(error);
        res.status(500).send("Server error while sending notification.");
    });
}

export default sendNotification;