import { DataTypes, Sequelize } from "sequelize";
import db from "./config";
import Thesis from "./Thesis";

const Feedback = db.sequelize.define("Feedback", {
    id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true
    },
    thesis_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Thesis,
            key: "id"
        }
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
    tableName: "feedback"
});

Thesis.hasMany(Feedback, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    foreignKey: "thesis_id"
});
Feedback.belongsTo(Thesis, {foreignKey: "thesis_id"});

export default Feedback;