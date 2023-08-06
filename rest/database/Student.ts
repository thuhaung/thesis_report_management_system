import { DataTypes } from "sequelize";
import db from "./config";
import User from "./User";
import UserType from "./UserType";
import Instructor from "./Instructor";

const Student = db.sequelize.define("Student", {
    student_id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        references: {
            model: User,
            key: "id"
        }
    },
    instructor_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Instructor,
            key: "instructor_id"
        }
    },
    has_submitted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    tableName: "student"
});

User.hasOne(Student, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    foreignKey: "student_id"
});

Instructor.hasMany(Student, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    foreignKey: "instructor_id"
});

Student.belongsTo(User, {foreignKey: "student_id"});
Student.belongsTo(Instructor, {foreignKey: "instructor_id"});

export default Student;