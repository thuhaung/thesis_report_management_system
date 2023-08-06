import { Request, Response } from "express";
import NotificationSeen from "../../database/NotificationSeen";
import { Model } from "sequelize";

const viewNotification = async (req: Request, res: Response) => {
    const notificationChange: {[key: string]: any} = req.body.notification_change;

    NotificationSeen.create(notificationChange as any).then(() => {
        res.status(200).send(notificationChange.user_id + " has seen the notification " + notificationChange.notification_id);
    }).catch(error => {
        console.log(error);
        res.status(500).send("Server error. Cannot change notification status.");
    });
}

export default viewNotification;