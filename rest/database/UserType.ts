import { DataTypes } from "sequelize";
import db from "./config";

const UserType = db.sequelize.define("UserType", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    type_name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: "user_type"
});



export default UserType;