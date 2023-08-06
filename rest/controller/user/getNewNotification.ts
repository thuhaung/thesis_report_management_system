import { Request, Response } from "express";
import Notification from "../../database/Notification";
import NotificationSeen from "../../database/NotificationSeen";
import { Model } from "sequelize";
import User from "../../database/User";

const getNewNotification = async (req: Request, res: Response) => {
    const userId: string = req.body.user_id;
    const user: Model | null = await User.findOne({where: {id: userId}});

    if (user) {
        const seenNotifications: Model[] | null = await NotificationSeen.findAll({where: {user_id: userId}});
        const allNotifications: Model[] | null = await Notification.findAll();
    
        const data: {[key: string]: any} = {new_notifications: []};
    
        if (seenNotifications?.length > 0) {
            for (let i = 0; i < allNotifications.length; i++) {
                const notification: Model | null = await NotificationSeen.findOne({where: {notification_id: allNotifications[i].dataValues.id, user_id: userId}});
            
                if (!notification) {
                    data.new_notifications.push(allNotifications[i]);
                }
            }
        }
        else {
            data.new_notifications = allNotifications;
        }
        
        res.status(200).send(data);
    }
    else {
        res.status(500).send("User not found.");
    }
}

export default getNewNotification;