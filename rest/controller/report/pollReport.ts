import { Request, Response } from "express";
import Thesis from "../../database/Thesis";
import Event from "../../database/Event";
import { Model } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const pollReport = async (req: Request, res: Response) => {
    const thesisId: string = req.body.thesis_id;

    const events: Model[] | null = await Event.findAll({where: {thesis_id: thesisId}});

    if (events) {
        let eventServices: any[] = [];
        let count: number = 0;
        const data: {[key: string]: any} = {};

        eventServices = events.map(event => event.dataValues);
        eventServices = eventServices.map(({service_type, service_status, result}) => ({service_type, service_status, result}));

        data.services = eventServices;

        let services: string | string[] = process.env.SERVICE_LIST!;
        services = services.split(",");

        if (eventServices.filter(service => (service.service_status === "Finished" || service.service_status === "Service error")).length === services.length) {
            data.finished = true;
        }
        
        res.status(200).send(data);
    }
    else {
        res.status(500).send("Events not found for thesis.");
    }
}

export default pollReport;