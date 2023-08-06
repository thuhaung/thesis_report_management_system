import { DataTypes } from "sequelize";
import db from "./config";
import UserType from "./UserType";

const User = db.sequelize.define("User", {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    full_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: UserType,
            key: "id"
        }
    }
}, {
    tableName: "user"
});

UserType.hasOne(User, {foreignKey: "type_id"});
User.belongsTo(UserType, {foreignKey: "type_id"});

export default User;