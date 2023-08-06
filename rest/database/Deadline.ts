import { DataTypes, Sequelize } from "sequelize";
import db from "./config";

const Deadline = db.sequelize.define("Deadline", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    deadline: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: "deadline"
});

export default Deadline;