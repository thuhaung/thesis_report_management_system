import { DataTypes } from "sequelize";
import db from "./config";
import User from "./User";
import UserType from "./UserType";

const Instructor = db.sequelize.define("Instructor", {
    instructor_id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        references: {
            model: User,
            key: "id"
        }
    }
}, {
    tableName: "instructor"
});

User.hasOne(Instructor, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    foreignKey: "instructor_id"
});

Instructor.belongsTo(User, {foreignKey: "instructor_id"});

export default Instructor;