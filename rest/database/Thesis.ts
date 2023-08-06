import { DataTypes } from "sequelize";
import db from "./config";
import Instructor from "./Instructor";
import Student from "./Student";

const Thesis = db.sequelize.define("Thesis", {
    id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true
    },
    instructor_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Instructor,
            key: "instructor_id"
        }
    },
    student_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Student,
            key: "student_id"
        }
    },
    thesis_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    file_location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    file_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    submitted_time: {
        type: DataTypes.DATE,
        allowNull: false
    },
    // output_locations: {
    //     type: DataTypes.ARRAY(DataTypes.STRING),
    //     defaultValue: [],
    //     allowNull: true
    // }
}, {
    tableName: "thesis"
});

Student.hasOne(Thesis, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    foreignKey: "student_id"
});

Instructor.hasMany(Thesis, {
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
    foreignKey: "instructor_id"
});

Thesis.belongsTo(Student, {foreignKey: "student_id"});
Thesis.belongsTo(Instructor, {foreignKey: "instructor_id"});

export default Thesis;