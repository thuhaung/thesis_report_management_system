import { DataTypes, Sequelize } from "sequelize";
import db from "./config";

const Notification = db.sequelize.define("Notification", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.STRING,
        allowNull: false
    },
    submitted_time: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: "notification"
});

export default Notification;