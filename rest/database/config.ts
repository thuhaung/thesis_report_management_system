import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

class Database {
    private host: string;
    private userName: string;
    private password: string;
    private db: string;

    public sequelize: Sequelize;
    
    constructor() {
        this.host = process.env.POSTGRES_HOST!;
        this.userName = process.env.POSTGRES_USER!;
        this.password = process.env.POSTGRES_PASSWORD!;
        this.db = process.env.POSTGRES_DATABASE!;

        this.sequelize = new Sequelize(this.db, this.userName, this.password, {
            host: this.host,
            dialect: "postgres",
            define: {
                timestamps: false
            }
        });
    }
    
    public connect = async () => {
        try {
            await this.sequelize.authenticate();
            await this.sequelize.sync();
            console.log("Database connected successfully.");
        } catch (error) {
            console.error("Unable to connect to database: ", error);
        }
    }
}

const db: Database = new Database();
export default db;