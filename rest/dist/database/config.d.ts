import { Sequelize } from "sequelize";
declare class Database {
    private host;
    private userName;
    private password;
    private db;
    sequelize: Sequelize;
    constructor();
    connect: () => Promise<void>;
}
declare const db: Database;
export default db;
