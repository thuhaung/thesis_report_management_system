import { DataTypes, Sequelize } from "sequelize";
import User from "./User";
import Notification from "./Notification";
import db from "./config";

const NotificationSeen = db.sequelize.define("NotificationSeen", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    notification_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Notification,
            key: "id"
        }
    },
    user_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: User,
            key: "id"
        }
    }
}, {
    tableName: "notification_seen"
});

export default NotificationSeen;