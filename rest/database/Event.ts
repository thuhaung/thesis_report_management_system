import { DataTypes } from "sequelize";
import db from "./config";
import Thesis from "./Thesis";

const Event = db.sequelize.define("Event", {
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
    service_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    output_location: {
        type: DataTypes.STRING,
        allowNull: true
    },
    service_status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    result: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: "event"
});

Thesis.hasMany(Event, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    foreignKey: "thesis_id"
});

Event.belongsTo(Thesis, {foreignKey: "thesis_id"});

export default Event;